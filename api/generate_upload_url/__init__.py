import logging
import os
import azure.functions as func
from azure.storage.blob import BlobServiceClient, BlobSasPermissions, generate_blob_sas
from datetime import datetime, timedelta

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to generate an upload URL.')

    # Get the user ID from the request headers
    user_id = req.headers.get('x-ms-client-principal-id')
    if not user_id:
        logging.error("User ID not found in headers. Make sure the user is authenticated.")
        return func.HttpResponse(
             "User not authenticated. Please log in.",
             status_code=401
        )

    # Get the filename from the query parameters
    file_name = req.params.get('fileName')
    if not file_name:
        return func.HttpResponse(
             "Please pass a fileName on the query string",
             status_code=400
        )

    try:
        # Get the storage connection string from application settings
        storage_connection_string = os.environ["AzureWebJobsStorage"]
        container_name = "pitches"

        # Create a blob service client
        blob_service_client = BlobServiceClient.from_connection_string(storage_connection_string)

        # Define the blob name, including the user's ID to keep files organized and unique
        blob_name = f"{user_id}/{file_name}"

        # Generate a SAS token that is valid for 1 hour
        sas_token = generate_blob_sas(
            account_name=blob_service_client.account_name,
            container_name=container_name,
            blob_name=blob_name,
            account_key=blob_service_client.credential.account_key,
            permission=BlobSasPermissions(write=True, create=True),
            expiry=datetime.utcnow() + timedelta(hours=1)
        )

        # Construct the full upload URL
        upload_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"

        return func.HttpResponse(upload_url, status_code=200)

    except Exception as e:
        logging.error(f"Error generating SAS URL: {e}")
        return func.HttpResponse(
             "An error occurred while generating the upload URL.",
             status_code=500
        )
