import logging
import azure.functions as func
import json
import openai
import os
import csv
from typing import Dict, Any

openai.api_key = os.environ["OPENAI_API_KEY"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        # Load the rubric
        rubric_path = os.path.join(os.path.dirname(__file__), '..', 'rubric.csv')
        with open(rubric_path, mode='r', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            rubric = list(reader)
        
        rubric_text = "\n".join([','.join(row) for row in rubric])

        req_body = req.get_json()

        # Create a detailed pitch text from all form fields
        pitch_data = {
            # Founders
            'technical_work': req_body.get('technicalWork', 'Not provided'),
            'looking_for_cofounder': req_body.get('lookingForCofounder', 'Not provided'),
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
1.  `evaluation`: An array of objects, where each object has two keys: `area` (the name of the rubric area) and `rating` (the category you selected, e.g., 'Strong').
2.  `first_question`: A string containing the single follow-up question.

Example JSON output:
{{
  "evaluation": [
    {{ "area": "Founders & Team", "rating": "Strong" }},
    {{ "area": "Idea & Domain", "rating": "Basic" }}
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

        return func.HttpResponse(
            response.choices[0].message.content,
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
