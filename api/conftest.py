import pytest
import os

@pytest.fixture(scope="session", autouse=True)
def set_test_environment():
    """This fixture runs automatically for the entire test session.
    It sets necessary environment variables before any tests are collected.
    """
    os.environ["OPENAI_API_KEY"] = "DUMMY_KEY_FOR_TESTING"
