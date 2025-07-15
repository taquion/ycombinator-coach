import json
import azure.functions as func
import pytest
import os

# By placing tests in a parallel directory, we can import the function
# from the __init__.py file of the target function app
from azure.cosmos import CosmosClient
from ..evaluate_pitch import main as evaluate_pitch_main

# Mock the OpenAI API client
@pytest.fixture
def mock_openai_client(mocker):
    mock_client = mocker.patch('openai.ChatCompletion')
    # Simulate the structure of the OpenAI response object
    mock_choice = mocker.MagicMock()
    mock_choice.message.content = json.dumps({
        "evaluation": [
            {"area": "Founders & Team", "rating": "Strong"}
        ],
        "first_question": "This is a test question."
    })
    mock_response = mocker.MagicMock()
    mock_response.choices = [mock_choice]
    mock_client.create.return_value = mock_response
    return mock_client

@pytest.fixture
def mock_cosmos_client(mocker):
    """Mocks the Cosmos DB client and its methods."""
    # Mock the client constructor and the chain of method calls
    mock_from_connection_string = mocker.patch('azure.cosmos.CosmosClient.from_connection_string')
    mock_client_instance = mocker.MagicMock(spec=CosmosClient)
    mock_db_instance = mocker.MagicMock()
    mock_container_instance = mocker.MagicMock()

    mock_from_connection_string.return_value = mock_client_instance
    mock_client_instance.get_database_client.return_value = mock_db_instance
    mock_db_instance.get_container_client.return_value = mock_container_instance

    # Return the mock container so we can assert calls to its methods (e.g., upsert_item)
    return mock_container_instance



def test_evaluate_pitch_happy_path(mock_openai_client, mock_cosmos_client):
    """Tests a successful run of the evaluate_pitch function."""
    # 1. Prepare a sample HTTP request with a valid JSON body
    sample_body = {
        "founders": [
            {
                "name": "Ada Lovelace",
                "title": "CEO",
                "equity": "50",
                "technical": "Yes",
                "linkedin": "https://linkedin.com/in/ada",
                "education": [{"school": "University of London", "degree": "Mathematics", "edu-dates": "1840-1843"}],
                "work": [{"company-title": "Analytical Engine Programmer", "work-dates": "1843-1852"}]
            }
        ],
        "startupName": "Analytical Engines Inc.",
        "oneLiner": "We build the future of computing.",
        "userId": "test-user-123" # Added userId as it's now required
    }

    req = func.HttpRequest(
        method='POST',
        body=json.dumps(sample_body).encode('utf-8'),
        url='/api/evaluate_pitch',
        headers={'Content-Type': 'application/json'}
    )

    # 2. Call the function
    resp = evaluate_pitch_main(req)

    # 3. Assert the response is what we expect
    assert resp.status_code == 200
    assert resp.mimetype == 'application/json'

    response_json = json.loads(resp.get_body())
    assert response_json['first_question'] == "This is a test question."
    assert len(response_json['evaluation']) == 1
    assert response_json['evaluation'][0]['rating'] == 'Strong'

    # 4. Assert that the OpenAI client was called correctly
    mock_openai_client.create.assert_called_once()
    call_args = mock_openai_client.create.call_args[1]
    assert call_args['model'] == 'gpt-4'
    # Check that founder data is in the prompt sent to the AI
    system_prompt = call_args['messages'][0]['content']
    user_content = call_args['messages'][1]['content']
    assert 'Ada Lovelace' in user_content
    assert 'Analytical Engines Inc.' in user_content

    # 5. Assert that Cosmos DB was called correctly
    assert mock_cosmos_client.upsert_item.call_count == 2
    # First call: save initial application
    first_call_args = mock_cosmos_client.upsert_item.call_args_list[0][1]['body']
    assert first_call_args['userId'] == 'test-user-123'
    assert 'application_details' in first_call_args
    assert first_call_args['application_details']['startupName'] == 'Analytical Engines Inc.'
    assert first_call_args['conversation_history'] == []

    # Second call: save updated conversation with AI response
    second_call_args = mock_cosmos_client.upsert_item.call_args_list[1][1]['body']
    assert len(second_call_args['conversation_history']) == 1
    first_message = second_call_args['conversation_history'][0]
    assert first_message['role'] == 'assistant'
    assert first_message['content']['first_question'] == "This is a test question."

def test_evaluate_pitch_missing_userid():
    """Tests the function's response to a request missing the userId."""
    # 1. Prepare a request with a body that lacks the 'userId' field
    sample_body_no_user = {
        "startupName": "Test Corp"
    }
    req = func.HttpRequest(
        method='POST',
        body=json.dumps(sample_body_no_user).encode('utf-8'),
        url='/api/evaluate_pitch',
        headers={'Content-Type': 'application/json'}
    )

    # 2. Call the function
    resp = evaluate_pitch_main(req)

    # 3. Assert that it returns a 401 Unauthorized error
    assert resp.status_code == 401
    response_json = json.loads(resp.get_body())
    assert 'User ID is missing' in response_json['error']
