import logging
import json
import azure.functions as func
import os
from azure.cosmos import CosmosClient, PartitionKey

# Get Cosmos DB connection details from App Settings
connection_string = os.environ['CosmosDbConnectionString']
database_name = 'ycoachdb'
container_name = 'profiles'

# Initialize CosmosClient
# This is done outside the main function to reuse the client across multiple function invocations
# as recommended by Microsoft for performance.
cosmos_client = CosmosClient.from_connection_string(connection_string)
database_client = cosmos_client.get_database_client(database_name)
container_client = database_client.get_container_client(container_name)

def main(req: func.HttpRequest) -> func.HttpResponse:
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
        # Use upsert_item to create or update the document.
        # This is more robust than create_item.
        container_client.upsert_item(body=req_body)
        logging.info(f"Successfully saved document with id: {user_id} to Cosmos DB.")
        return func.HttpResponse(
            json.dumps({"message": "Profile saved successfully."}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        # Log the full exception for better debugging
        logging.error(f"Error saving document to Cosmos DB: {e}", exc_info=True)
        return func.HttpResponse("Error saving profile to the database.", status_code=500)
