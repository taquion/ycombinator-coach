# Force git detection
import logging
import json
import azure.functions as func
import bcrypt
import uuid
import os

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('--- CHECKPOINT 1: Signup function invoked ---')

    # Check for connection string early
    if not os.environ.get('CosmosDbConnectionString'):
        logging.error('--- FATAL: CosmosDbConnectionString is not set. ---')
        return func.HttpResponse("Server configuration error.", status_code=500)
    logging.info('--- CHECKPOINT 2: Cosmos DB connection string found. ---')

    try:
        req_body = req.get_json()
        logging.info('--- CHECKPOINT 3: Request body parsed successfully. ---')
    except ValueError:
        logging.error('--- ERROR: Invalid JSON in request body. ---')
        return func.HttpResponse("Invalid JSON format.", status_code=400)

    email = req_body.get('email')
    password = req_body.get('password')

    if not email or not password:
        logging.warning('--- WARN: Email or password missing. ---')
        return func.HttpResponse("Please provide both email and password.", status_code=400)
    logging.info(f'--- CHECKPOINT 4: Received data for user: {email} ---')

    try:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        logging.info('--- CHECKPOINT 5: Password hashed successfully. ---')
    except Exception as e:
        logging.error(f'--- ERROR: Password hashing failed: {e} ---')
        return func.HttpResponse("Error processing user data.", status_code=500)

    new_user = {
        'id': str(uuid.uuid4()),
        'email': email.lower(),
        'hashed_password': hashed_password.decode('utf-8'),
        'tier': 'free'
    }
    logging.info(f'--- CHECKPOINT 6: User document created for {email}. Preparing to save. ---')

    try:
        doc.set(func.Document.from_dict(new_user))
        logging.info(f'--- CHECKPOINT 7: User document for {email} successfully set for Cosmos DB output. ---')
    except Exception as e:
        logging.error(f'--- FATAL: Failed to set document for Cosmos DB. Error: {e} ---')
        return func.HttpResponse("Failed to save user data to the database.", status_code=500)

    logging.info(f'--- SUCCESS: Account for {email} created. Returning 201 response. ---')
    return func.HttpResponse(
        json.dumps({'status': 'success', 'message': 'Account created successfully.'}),
        status_code=201,
        mimetype="application/json"
    )

