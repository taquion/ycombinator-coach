import azure.functions as func
import openai
import os
import json
from typing import Dict, Any

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Parse request body
        req_body = req.get_json()
        
        # Get API key from environment variables
        openai.api_key = os.getenv("OPENAI_API_KEY")
        if not openai.api_key:
            raise ValueError("OpenAI API key is not configured")
        
        # Generate the prompt
        prompt = create_prompt(req_body)
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert startup advisor helping founders create compelling Y Combinator pitches. "
                              "Generate a clear, concise, and compelling 60-second pitch based on the provided information. "
                              "After the pitch, provide a YC readiness score (1-10) and 2-3 actionable suggestions."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extract the generated content
        feedback = response.choices[0].message.content.strip()
        
        return func.HttpResponse(
            json.dumps({"feedback": feedback}),
            mimetype="application/json",
            status_code=200
        )
        
    except Exception as e:
        error_message = f"Error generating pitch: {str(e)}"
        return func.HttpResponse(
            json.dumps({"error": error_message}),
            mimetype="application/json",
            status_code=500
        )

def create_prompt(data: Dict[str, Any]) -> str:
    """Create a structured prompt for the AI based on form data."""
    return f"""Create a compelling YC pitch for the following startup:

Startup Name: {data.get('name', 'Unnamed Startup')}
One-liner: {data.get('description', 'No description provided')}

Problem:
{data.get('problem', 'No problem statement provided')}

Solution:
{data.get('solution', 'No solution provided')}

Team:
{data.get('team', 'No team information provided')}

Traction:
{data.get('traction', 'No traction yet')}

Please provide:
1. A compelling 60-second pitch
2. YC Readiness Score (1-10) with brief rationale
3. 2-3 specific, actionable suggestions for improvement"""
