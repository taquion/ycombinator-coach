import logging
import azure.functions as func
import json
import openai
import os
from typing import Dict, Any

openai.api_key = os.environ["OPENAI_API_KEY"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are an AI simulating a Y Combinator partner, like Paul Graham or Garry Tan. Your feedback should be direct, insightful, and brutally honest, but ultimately constructive. Your goal is to help the founder strengthen their pitch.

Analyze the following startup pitch based on the standard YC criteria:
1.  **Clarity & Conciseness:** Is the one-liner clear? Is the problem well-defined?
2.  **Market Size:** Is this a big enough problem?
3.  **Solution:** Is the solution compelling and differentiated?
4.  **Team:** Is this the right team to solve this problem?
5.  **Traction:** Is there evidence of progress?

Structure your feedback using Markdown with the following sections:

### Overall Impression:
(A brief, one-paragraph summary of your thoughts.)

### Strengths:
(Use a bulleted list to highlight what you liked about the idea, team, or traction.)

### Red Flags & Concerns:
(Use a bulleted list for the biggest weaknesses, potential risks, or unclear points.)

### Actionable Questions to Consider:
(A list of 3-5 tough questions the founder should be prepared to answer.)"""},
                {"role": "user", "content": f"Startup Name: {req_body.get('startupName', '')}\n\nOne-liner: {req_body.get('oneLiner', '')}\n\nProblem: {req_body.get('problem', '')}\n\nSolution: {req_body.get('solution', '')}\n\nTeam: {req_body.get('team', '')}\n\nTraction: {req_body.get('traction', '')}"}
            ]
        )
        
        return func.HttpResponse(
            json.dumps({"feedback": response.choices[0].message.content}),
            mimetype="application/json"
        )
        
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
