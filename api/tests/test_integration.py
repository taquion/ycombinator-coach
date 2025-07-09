import pytest
import openai
import os

# This test will only run when specifically requested via its mark.
# It requires the OPENAI_API_KEY to be set in the environment.
@pytest.mark.integration
def test_openai_api_connection():
    """Makes a real, simple call to the OpenAI API to verify the key and connection."""
    api_key = os.environ.get("OPENAI_API_KEY")
    
    # The test is skipped if the key is not found. This allows our main
    # unit tests (which don't need a key) to run without issue.
    if not api_key:
        pytest.skip("Skipping integration test: OPENAI_API_KEY not found in environment.")

    openai.api_key = api_key

    try:
        # Make a very simple and cheap API call
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a test assistant."},
                {"role": "user", "content": "Respond with the single word: 'success'"}
            ],
            max_tokens=5
        )

        # Assert that we got a valid response
        assert response.choices
        assert len(response.choices) > 0
        assert "success" in response.choices[0].message.content.lower()

    except Exception as e:
        # If the API call fails for any reason, the test fails.
        pytest.fail(f"OpenAI API call failed with exception: {e}")
