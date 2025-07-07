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
        pitch_text = f"""Startup Name: {req_body.get('startupName', '')}
One-liner: {req_body.get('oneLiner', '')}
Problem: {req_body.get('problem', '')}
Solution: {req_body.get('solution', '')}
Team: {req_body.get('team', '')}
Traction: {req_body.get('traction', '')}"""

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
