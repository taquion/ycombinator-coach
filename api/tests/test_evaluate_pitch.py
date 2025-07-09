import json
import azure.functions as func
import pytest
import os

# By placing tests in a parallel directory, we can import the function
# from the __init__.py file of the target function app
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


def test_evaluate_pitch_happy_path(mock_openai_client):
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
        "oneLiner": "We build the future of computing."
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

def test_evaluate_pitch_error_handling():
    """Tests the function's response to a request with missing data."""
    # 1. Prepare a request with an empty body
    req = func.HttpRequest(
        method='POST',
        body=b'',
        url='/api/evaluate_pitch',
        headers={'Content-Type': 'application/json'}
    )

    # 2. Call the function
    resp = evaluate_pitch_main(req)

    # 3. Assert that it returns a 500 error
    assert resp.status_code == 500
    response_json = json.loads(resp.get_body())
    assert 'error' in response_json
