import logging
import json
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a login request.')

    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse(
             "Invalid JSON format in request body.",
             status_code=400
        )

    email = req_body.get('email')
    password = req_body.get('password')

    if not email or not password:
        return func.HttpResponse(
             "Please provide both email and password.",
             status_code=400
        )

    # --- Placeholder Logic ---
    # In a real application, you would verify the credentials against a database.
    # For now, we'll simulate a successful login if any email/password is provided.
    logging.info(f"Simulating login for user: {email}")

    # Simulate a successful login response
    response_data = {
        "status": "success",
        "message": f"Login successful for {email}.",
        "user_id": "user_12345" # Placeholder user ID
    }

    return func.HttpResponse(
        json.dumps(response_data),
        status_code=200,
        mimetype="application/json"
    )
