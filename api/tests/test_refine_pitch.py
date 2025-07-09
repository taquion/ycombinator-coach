import json
import azure.functions as func
import pytest

from ..refine_pitch import main as refine_pitch_main

# The conftest.py in the parent directory handles the dummy API key

@pytest.fixture
def mock_openai_client_refine(mocker):
    mock_client = mocker.patch('openai.ChatCompletion')
    mock_choice = mocker.MagicMock()
    mock_choice.message.content = json.dumps({
        "refined_pitch": {
            "one_liner": "A new and improved one-liner."
        }
    })
    mock_response = mocker.MagicMock()
    mock_response.choices = [mock_choice]
    mock_client.create.return_value = mock_response
    return mock_client

def test_refine_pitch_happy_path(mock_openai_client_refine):
    """Tests a successful run of the refine_pitch function."""
    # 1. Prepare a sample HTTP request
    sample_body = {
        "pitch": {
            "startupName": "Analytical Engines Inc.",
            "oneLiner": "We build the future of computing."
        },
        "history": [
            {"role": "user", "content": "Initial pitch..."},
            {"role": "assistant", "content": "Great start, but can you clarify X?"},
            {"role": "user", "content": "Yes, X is..."}
        ],
        "founders": [] # The function also processes founders, so we include it.
    }

    req = func.HttpRequest(
        method='POST',
        body=json.dumps(sample_body).encode('utf-8'),
        url='/api/refine_pitch',
        headers={'Content-Type': 'application/json'}
    )

    # 2. Call the function
    resp = refine_pitch_main(req)

    # 3. Assert the response is what we expect
    assert resp.status_code == 200
    assert resp.mimetype == 'application/json'

    response_json = json.loads(resp.get_body())
    assert 'refined_pitch' in response_json
    assert response_json['refined_pitch']['one_liner'] == "A new and improved one-liner."

    # 4. Assert that the OpenAI client was called
    mock_openai_client_refine.create.assert_called_once()
