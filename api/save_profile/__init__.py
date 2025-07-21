import logging
import azure.functions as func
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('--- Save Profile function triggered. ---')

    # 1. Parse JSON from the request body
    try:
        req_body = req.get_json()
    except ValueError:
        logging.error("Invalid JSON in request body.")
        return func.HttpResponse("Invalid JSON in request body.", status_code=400)

    # 2. Validate that 'userId' exists and set it as the document 'id'
    user_id = req_body.get('userId')
    if not user_id:
        logging.error("'userId' is missing from the request body.")
        return func.HttpResponse("Error: 'userId' is missing from the request body.", status_code=400)
    
    req_body['id'] = user_id

    # 3. Set the document for the Cosmos DB output binding.
    # The Azure Functions runtime handles the actual database operation after the function returns.
    try:
        doc.set(func.Document.from_dict(req_body))
        logging.info(f"Document with id: {user_id} prepared for Cosmos DB.")
    except Exception as e:
        logging.error(f"Error setting document for Cosmos DB: {e}")
        return func.HttpResponse("Error preparing document for database.", status_code=500)

    # 4. Return a success response
    return func.HttpResponse(
        json.dumps({"message": "Profile saved successfully."}),
        status_code=200,
        mimetype="application/json"
    )
