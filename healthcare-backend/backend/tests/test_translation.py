import sys
from pathlib import Path

# Ensure the backend package root is on sys.path when running tests from the repo root
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.translation_service import get_translation_service


def test_translation_service():
    service = get_translation_service()
    text = "Take Paracetamol 500 mg twice a day after food."
    result = service.translate(
        text=text,
        target_lang="kn",
        protect_terms=["Paracetamol"],
    )
    assert result is not None
    assert isinstance(result, str)
    assert len(result) > 0


if __name__ == "__main__":
    test_translation_service()