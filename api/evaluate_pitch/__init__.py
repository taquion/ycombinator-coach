import logging
import azure.functions as func
import json
import openai
import os
import csv
import uuid
from typing import Dict, Any
from azure.cosmos import CosmosClient, PartitionKey

def main(req: func.HttpRequest) -> func.HttpResponse:
    # By moving the key assignment here, we ensure it only runs when the function is called.
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    if not openai.api_key:
        return func.HttpResponse(
            json.dumps({"error": "The OPENAI_API_KEY environment variable is not set."}),
            status_code=500,
            mimetype="application/json"
        )
    logging.info('Python HTTP trigger function processed a request.')

    try:
        # Load the rubric
        rubric_path = os.path.join(os.path.dirname(__file__), '..', 'rubric.csv')
        with open(rubric_path, mode='r', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            rubric = list(reader)
        
        rubric_text = "\n".join([','.join(row) for row in rubric])

        req_body = req.get_json()

        # --- Cosmos DB Connection and Data Persistence ---
        # Expecting userId to be passed from the authenticated frontend
        user_id = req_body.get('userId')
        if not user_id:
            return func.HttpResponse(
                json.dumps({"error": "User ID is missing. User must be logged in."}),
                status_code=401,
                mimetype="application/json"
            )

        # Initialize Cosmos Client
        cosmos_client = CosmosClient.from_connection_string(os.environ["CosmosDbConnectionString"])
        database = cosmos_client.get_database_client(os.environ["COSMOS_DB_DATABASE_NAME"])
        container = database.get_container_client(os.environ["COSMOS_DB_CONTAINER_NAME"])

        # Create a new application document
        application_id = str(uuid.uuid4())
        application_data = {
            'id': application_id,
            'userId': user_id,
            'application_details': req_body, # Save the entire original request
            'conversation_history': [] # Initialize conversation history
        }

        # Save the initial application to Cosmos DB
        container.upsert_item(body=application_data)
        logging.info(f"Successfully saved initial application {application_id} for user {user_id}.")


        # --- Founder Profile Aggregation ---
        founders_data = req_body.get('founders', [])
        founder_profiles_text = ""
        for i, founder in enumerate(founders_data):
            founder_profiles_text += f"--- Founder {i+1} Profile ---\n"
            founder_profiles_text += f"Name: {founder.get('name', 'Not provided')}\n"
            founder_profiles_text += f"Role: {founder.get('title', 'Not provided')}\n"
            founder_profiles_text += f"Equity: {founder.get('equity', 'Not provided')}%\n"
            founder_profiles_text += f"Is Technical: {founder.get('technical', 'Not provided')}\n"
            founder_profiles_text += f"LinkedIn: {founder.get('linkedin', 'Not provided')}\n"
            
            education_history = founder.get('education', [])
            if education_history:
                founder_profiles_text += "Education:\n"
                for edu in education_history:
                    founder_profiles_text += f"  - School: {edu.get('school', 'N/A')}, Degree: {edu.get('degree', 'N/A')}, Dates: {edu.get('edu-dates', 'N/A')}\n"
            
            work_history = founder.get('work', [])
            if work_history:
                founder_profiles_text += "Work History:\n"
                for work in work_history:
                    founder_profiles_text += f"  - Company/Title: {work.get('company-title', 'N/A')}, Dates: {work.get('work-dates', 'N/A')}\n"
            founder_profiles_text += "\n"

        # Create a detailed pitch text from all form fields
        pitch_data = {
            # Founders
            'founder_profiles': founder_profiles_text.strip(),
            'technical_work_responsibilities': req_body.get('technicalWork', 'Not provided'),
            'looking_for_cofounder_status': req_body.get('lookingForCofounder', 'Not provided'),
            # Company
            'company_name': req_body.get('startupName', 'Not provided'),
            'company_url': req_body.get('companyUrl', 'Not provided'),
            'product_demo_link': req_body.get('productLink', 'Not provided'),
            'location_decision': req_body.get('locationDecision', 'Not provided'),
            # Progress
            'progress_status': req_body.get('progressStatus', 'Not provided'),
            'users_status': req_body.get('users', 'Not provided'),
            'revenue_status': req_body.get('revenue', 'Not provided'),
            'previous_accelerators': req_body.get('accelerators', 'Not provided'),
            # Idea
            'one_liner': req_body.get('oneLiner', 'Not provided'),
            'problem': req_body.get('problem', 'Not provided'),
            'solution': req_body.get('solution', 'Not provided'),
            'target_market': req_body.get('targetMarket', 'Not provided'),
            'how_to_get_users': req_body.get('howToGetUsers', 'Not provided'),
            'category': req_body.get('category', 'Not provided'),
            'other_ideas': req_body.get('otherIdeas', 'Not provided'),
            # Equity
            'legal_entity': req_body.get('legalEntity', 'Not provided'),
            'investment_taken': req_body.get('investment', 'Not provided'),
            'fundraising_now': req_body.get('fundraising', 'Not provided'),
            # Curious
            'why_yc': req_body.get('whyYc', 'Not provided'),
            'how_heard': req_body.get('howHeard', 'Not provided'),
        }

        pitch_text = json.dumps(pitch_data, indent=2)

        system_prompt = f"""You are an AI simulating a Y Combinator partner. Your task is to evaluate a startup pitch based on a provided rubric and then ask a single, insightful follow-up question to help the founder refine their pitch.

First, analyze the user's pitch against the rubric provided below. For each 'Area' in the rubric, decide which category ('Not-Ready', 'Basic', 'Strong', 'YC-Ready') best fits the pitch. You MUST select one category for each area.

**Rubric:**
{rubric_text}

After your evaluation, formulate ONE concise, thought-provoking question that targets the weakest area of the pitch. This question should prompt the founder to provide more specific information or think more deeply about a critical aspect of their business.

Your response MUST be a JSON object with two keys:
1.  `evaluation`: An array of objects, where each object has three keys: `area` (the name of the rubric area), `rating` (the category you selected, e.g., 'Strong'), and `feedback` (a concise, one-sentence explanation for the rating, providing specific, actionable advice).
2.  `first_question`: A string containing the single follow-up question that targets the weakest area.

Example JSON output:
{{
  "evaluation": [
    {{ "area": "Founders & Team", "rating": "Strong" }},
    {{ "area": "Idea & Domain", "rating": "Basic", "feedback": "The problem you're solving is clear, but your target market seems too broad; narrowing your focus to a specific customer segment could strengthen your pitch." }}
  ],
  "first_question": "You mentioned your team has experience from top tech companies, but can you be more specific about what projects they led that are directly relevant to the challenges your startup will face?"
}}
"""

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": pitch_text}
            ],

        )

        ai_response_content = response.choices[0].message.content

        # --- Save AI response to conversation history ---
        try:
            # Attempt to parse the AI response to ensure it's valid JSON
            report_json = json.loads(ai_response_content)
            application_data['conversation_history'].append({
                'role': 'assistant',
                'content': report_json
            })
            # Update the item in Cosmos DB with the new conversation
            container.upsert_item(body=application_data)
            logging.info(f"Successfully saved AI report for application {application_id}.")
        except json.JSONDecodeError:
            logging.error("AI response was not valid JSON. Storing as raw string.")
            application_data['conversation_history'].append({
                'role': 'assistant',
                'content': ai_response_content
            })
            container.upsert_item(body=application_data)


        return func.HttpResponse(
            ai_response_content,
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
