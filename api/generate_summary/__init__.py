import logging
import azure.functions as func
import json
import openai
import os

def main(req: func.HttpRequest) -> func.HttpResponse:
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    if not openai.api_key:
        return func.HttpResponse(
            json.dumps({"error": "The OPENAI_API_KEY environment variable is not set."}),
            status_code=500,
            mimetype="application/json"
        )
    logging.info('Python HTTP trigger function for summary processed a request.')

    try:
        req_body = req.get_json()
        conversation_history = req_body.get('history', [])
        pitch_object = req_body.get('pitch', {})
        pitch_text = json.dumps(pitch_object, indent=2)

        if not conversation_history or not pitch_object:
            return func.HttpResponse(
                json.dumps({"error": "'history' and 'pitch' are required fields."}),
                status_code=400,
                mimetype="application/json"
            )

        system_prompt = f"""You are an AI simulating a Y Combinator partner, concluding a coaching session.

The founder has provided an initial pitch and has gone through several rounds of refinement with you. Your final task is to synthesize all the information into a single, improved, and cohesive pitch summary.

**Original Pitch Data:**
{pitch_text}

**Full Conversation History:**
{json.dumps(conversation_history, indent=2)}

Based on the original data and the clarifications from the conversation, generate a compelling and concise summary of the refined pitch. The summary should be well-structured, persuasive, and ready for a YC partner to read. Present it as a block of text, using markdown for emphasis (like **bolding** key points) where appropriate.

Your response MUST be a JSON object with a single key:
`summary`: A string containing the final pitch summary in markdown format.

Example JSON output:
{{
  "summary": "**Company:** ConnectSphere\n**One-liner:** We are a decentralized social network that gives users full control over their data.\n**Problem:** Users are tired of their data being exploited by large tech companies..."
}}
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Please generate the final summary based on our conversation."}
        ]

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages,
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
