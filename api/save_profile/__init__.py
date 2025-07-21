import logging
import json
import azure.functions as func
import os
import uuid
from azure.cosmos import CosmosClient

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('--- BULLETPROOF TEST a.k.a. PLAN RADICAL v2 ---')

    try:
        connection_string = os.environ['CosmosDbConnectionString']
        logging.info('Successfully read connection string from environment variables.')
    except KeyError:
        logging.error('FATAL: CosmosDbConnectionString not found in environment variables.')
        return func.HttpResponse("Database connection string is not configured.", status_code=500)

    database_name = 'ycoachdb'
    container_name = 'profiles'

    # Create a hardcoded document to test the connection
    test_id = f"test-{uuid.uuid4()}"
    test_document = {
        'id': test_id,
        'message': 'This is a bulletproof test.',
        'status': 'SUCCESS'
    }

    try:
        logging.info(f"Attempting to connect to Cosmos DB with client.")
        cosmos_client = CosmosClient.from_connection_string(connection_string)
        database_client = cosmos_client.get_database_client(database_name)
        container_client = database_client.get_container_client(container_name)
        logging.info(f"Client initialized. Attempting to save document id: {test_id}")
        
        container_client.upsert_item(body=test_document)
        
        logging.info(f"BULLETPROOF TEST SUCCEEDED. Document {test_id} saved.")
        return func.HttpResponse(
            json.dumps({"message": "Bulletproof test succeeded!", "id": test_id}),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"BULLETPROOF TEST FAILED: {e}", exc_info=True)
        return func.HttpResponse("Bulletproof test failed. Check logs for details.", status_code=500)
