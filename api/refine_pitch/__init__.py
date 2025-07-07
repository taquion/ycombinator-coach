import logging
import azure.functions as func
import json
import openai
import os

openai.api_key = os.environ["OPENAI_API_KEY"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function for refinement processed a request.')

    try:
        req_body = req.get_json()
        conversation_history = req_body.get('history', [])
        pitch_text = req_body.get('pitch', '')

        if not conversation_history or not pitch_text:
            return func.HttpResponse(
                json.dumps({"error": "'history' and 'pitch' are required fields."}),
                status_code=400,
                mimetype="application/json"
            )

        system_prompt = f"""You are an AI simulating a Y Combinator partner, continuing a coaching session.

The user has provided an initial pitch, which you have already evaluated. Now, you are in a refinement loop. The user has answered your previous question. Your task is to ask the *next* follow-up question.

**Original Pitch:**
{pitch_text}

**Conversation History:**
{json.dumps(conversation_history, indent=2)}

Based on the original pitch and the conversation so far, formulate ONE new, concise, and insightful question to further probe the user's thinking. The goal is to guide them to a stronger pitch. Do not repeat previous questions.

If this is the final round of questioning (e.g., the 3rd question), your question can be a bit more challenging or strategic.

Your response MUST be a JSON object with a single key:
`next_question`: A string containing your new follow-up question.

Example JSON output:
{{
  "next_question": "That's a clearer way to describe the initial user base. Now, how will you leverage that small, passionate group to cross the chasm to a much larger market?"
}}
"""

        # Construct messages for OpenAI API
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        # The user message will be the full context for the AI
        messages.append({"role": "user", "content": "Please provide the next question based on the context."}) 

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
            response_format={ "type": "json_object" }
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
