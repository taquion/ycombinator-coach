import logging
import json
import azure.functions as func
import bcrypt

def main(req: func.HttpRequest, docs: func.DocumentList) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a login request.')

    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON format in request body.", status_code=400)

    email = req_body.get('email')
    password = req_body.get('password')

    if not email or not password:
        return func.HttpResponse("Please provide both email and password.", status_code=400)

    if not docs:
        logging.warning(f"Login failed: No user found for email {email}")
        return func.HttpResponse("Invalid email or password.", status_code=401)

    user = docs[0]
    hashed_password = user['hashed_password']

    if bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
        logging.info(f"Successful login for user: {email}")
        response_data = {
            "status": "success",
            "message": f"Login successful for {email}.",
            "user_id": user['id']
        }
        return func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            mimetype="application/json"
        )
    else:
        logging.warning(f"Login failed: Incorrect password for email {email}")
        return func.HttpResponse("Invalid email or password.", status_code=401)
