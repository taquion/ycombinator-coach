import logging
import azure.functions as func
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    # Re-deploying to ensure connection string settings are applied.
    logging.info('--- Save Profile Function Triggered (Deployment Test) ---')

    try:
        # Log the raw request body to see exactly what is being sent
        req_body_bytes = req.get_body()
        req_body_str = req_body_bytes.decode('utf-8')
        logging.info(f"DEBUG: Raw request body received: {req_body_str}")

        # Get the profile data from the request body
        profile_data = req.get_json()
        logging.info(f"DEBUG: Parsed JSON data: {profile_data}")
    except ValueError:
        return func.HttpResponse(
             "Invalid JSON in request body.",
             status_code=400
        )

    # Get the user's email (userId) to use as the document ID
    # The frontend must send the user's email in the 'userId' field.
    user_id = profile_data.get('userId')
    if not user_id:
        return func.HttpResponse(
            "'userId' is missing from the request body.",
            status_code=400
        )

    # Set the 'id' of the document to the user's ID.
    # Cosmos DB uses 'id' as the unique identifier for documents in a container.
    profile_data['id'] = user_id

    try:
        # Set the document to be saved in Cosmos DB using the output binding.
        # The Azure Functions runtime will handle the actual database operation.
        doc.set(func.Document.from_dict(profile_data))

        # Return a success response
        return func.HttpResponse(
            json.dumps({"message": "Profile saved successfully."}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error saving document to Cosmos DB: {e}")
        return func.HttpResponse(
            "An error occurred while saving the profile.",
            status_code=500
        )
