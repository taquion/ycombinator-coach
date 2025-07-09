import json
import azure.functions as func
import pytest

from ..generate_summary import main as generate_summary_main

# The conftest.py handles the dummy API key

@pytest.fixture
def mock_openai_client_summary(mocker):
    mock_client = mocker.patch('openai.ChatCompletion')
    mock_choice = mocker.MagicMock()
    mock_choice.message.content = json.dumps({
        "summary": "This is a test summary.",
        "strengths": ["Strong team"],
        "weaknesses": ["Unclear market"] 
    })
    mock_response = mocker.MagicMock()
    mock_response.choices = [mock_choice]
    mock_client.create.return_value = mock_response
    return mock_client

def test_generate_summary_happy_path(mock_openai_client_summary):
    """Tests a successful run of the generate_summary function."""
    # 1. Prepare a sample HTTP request
    sample_body = {
        "pitch": {
            "startupName": "Test Startup",
            "oneLiner": "A test one-liner."
        },
        "history": [
            {"role": "user", "content": "This is my pitch."},
            {"role": "assistant", "content": "Interesting, tell me more."}
        ],
        "founders": []
    }

    req = func.HttpRequest(
        method='POST',
        body=json.dumps(sample_body).encode('utf-8'),
        url='/api/generate_summary',
        headers={'Content-Type': 'application/json'}
    )

    # 2. Call the function
    resp = generate_summary_main(req)

    # 3. Assert the response is what we expect
    assert resp.status_code == 200
    assert resp.mimetype == 'application/json'

    response_json = json.loads(resp.get_body())
    assert response_json['summary'] == "This is a test summary."
    assert len(response_json['strengths']) == 1

    # 4. Assert that the OpenAI client was called
    mock_openai_client_summary.create.assert_called_once()
