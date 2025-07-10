import logging
import json
import azure.functions as func
import bcrypt
import uuid

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a signup request.')

    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON format in request body.", status_code=400)

    email = req_body.get('email')
    password = req_body.get('password')

    if not email or not password:
        return func.HttpResponse("Please provide both email and password.", status_code=400)

    # Hash the password for security
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create a new document to be saved to Cosmos DB
    new_user = {
        'id': str(uuid.uuid4()),
        'email': email.lower(),
        'hashed_password': hashed_password.decode('utf-8'),
        'tier': 'free' # Default to free tier as requested
    }

    try:
        doc.set(func.Document.from_dict(new_user))
    except Exception as e:
        logging.error(f"Error saving to Cosmos DB: {e}")
        return func.HttpResponse("An error occurred while creating your account.", status_code=500)

    logging.info(f"Successfully created account for {email}")

    return func.HttpResponse(
        json.dumps({'status': 'success', 'message': 'Account created successfully.'}),
        status_code=201,
        mimetype="application/json"
    )
