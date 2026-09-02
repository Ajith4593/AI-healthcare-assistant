import json
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from server1 import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_chat_endpoint_returns_streaming_response(client):
    mock_citations = []
    mock_tokens = ["For ", "a ", "mild ", "fever, ", "stay ", "hydrated."]

    with patch("server1.get_pinecone_context_and_stream", return_value=(mock_citations, iter(mock_tokens))):
        response = client.post(
            "/api/chat",
            json={
                "query": "What should I do for a mild fever?",
                "history": [],
                "language": "English",
                "session_id": None,
            },
        )

        assert response.status_code == 200
        lines = [json.loads(line) for line in response.text.strip().split("\n") if line.strip()]
        assert len(lines) >= 2
        assert any(item.get("type") == "session" for item in lines)
        assert any(item.get("type") == "token" for item in lines)
