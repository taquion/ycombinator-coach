import logging
import azure.functions as func
import json
import openai
import os
import traceback
from typing import Dict, Any

openai.api_key = os.environ["OPENAI_API_KEY"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a YC partner providing feedback on startup pitches..."},
                {"role": "user", "content": f"Startup Name: {req_body.get('startupName', '')}\n\nOne-liner: {req_body.get('oneLiner', '')}\n\nProblem: {req_body.get('problem', '')}\n\nSolution: {req_body.get('solution', '')}\n\nTeam: {req_body.get('team', '')}\n\nTraction: {req_body.get('traction', '')}"}
            ]
        )
        
        return func.HttpResponse(
            json.dumps({"feedback": response.choices[0].message.content}),
            mimetype="application/json"
        )
        
    except Exception as e:
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        return func.HttpResponse(
            json.dumps(error_details),
            status_code=500,
            mimetype="application/json"
        )
