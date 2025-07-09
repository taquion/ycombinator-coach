import pytest
import os

# This fixture runs before any tests.
@pytest.fixture(scope="session", autouse=True)
def set_dummy_openai_api_key():
    """Set a dummy OpenAI API key for testing purposes if one is not already set."""
    if "OPENAI_API_KEY" not in os.environ:
        os.environ["OPENAI_API_KEY"] = "DUMMY_KEY_FOR_TESTING"
