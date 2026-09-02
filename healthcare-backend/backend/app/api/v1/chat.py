"""
chat.py — STUB / REFERENCE ONLY.

The production /api/chat endpoint is implemented in server1.py
(get_pinecone_context_and_stream + streaming NDJSON with Ollama/Groq/Gemini
fallback chain + session cache + query rewriting).

This file is kept as a reference / standalone-mode fallback but is NOT
mounted by main.py to avoid shadowing the real implementation when
server1.py loads the healthcare-backend sub-routers.
"""
from __future__ import annotations

import asyncio
import json
import os
import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    history: List[Dict[str, Any]] = []
    language: str = "English"
    session_id: Optional[str] = None


_embedding_model = None
_pinecone_index = None


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer

            _embedding_model = SentenceTransformer("BAAI/bge-m3", device="cpu")
        except Exception as exc:
            print(f"[Chat Router] Embedding model unavailable: {exc}")
            _embedding_model = False
    return _embedding_model


def _get_pinecone_index():
    global _pinecone_index
    if _pinecone_index is None:
        api_key = os.getenv("PINECONE_API_KEY", "").strip()
        index_name = os.getenv("PINECONE_INDEX_NAME", "infosys-healthcare-ai-assistant")
        if api_key and api_key != "YOUR_PINECONE_API_KEY":
            try:
                from pinecone import Pinecone

                pc = Pinecone(api_key=api_key)
                _pinecone_index = pc.Index(index_name)
            except Exception as exc:
                print(f"[Chat Router] Pinecone unavailable: {exc}")
                _pinecone_index = False
        else:
            _pinecone_index = False
    return _pinecone_index


def _build_fallback_response(query: str, language: str) -> str:
    lowered = query.lower()
    if any(term in lowered for term in ["fever", "temperature"]):
        return (
            "For a mild fever, rest, stay hydrated, and monitor your temperature regularly. "
            "Seek urgent medical help if the fever is very high, lasts several days, or comes with breathing trouble, confusion, or severe weakness."
        )

    if any(term in lowered for term in ["pain", "headache", "body ache"]):
        return (
            "For general pain or a mild headache, rest, hydrate, and use the medicine plan you were given by a clinician. "
            "Get immediate care if the pain is sudden, severe, or accompanied by weakness, numbness, or chest symptoms."
        )

    if any(term in lowered for term in ["diabetes", "sugar", "bp", "blood pressure"]):
        return (
            "Please follow your prescribed care plan and monitor symptoms closely. "
            "If you experience fainting, severe weakness, confusion, or chest pain, seek urgent medical care right away."
        )

    return (
        f"I can provide general health guidance in {language}. For safety, follow your clinician's advice closely and seek urgent care for severe symptoms such as chest pain, trouble breathing, confusion, fainting, or severe bleeding."
    )


async def _stream_chat_response(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    yield json.dumps({"type": "session", "session_id": session_id}) + "\n"

    citations: List[Dict[str, Any]] = []
    model = _get_embedding_model()
    index = _get_pinecone_index()

    if model and index:
        try:
            query_vector = model.encode(request.query, normalize_embeddings=True).tolist()
            response = index.query(vector=query_vector, top_k=3, include_metadata=True)
            for match in response.get("matches", []):
                metadata = match.get("metadata", {})
                text = metadata.get("raw_text") or metadata.get("text") or ""
                if text:
                    citations.append(
                        {
                            "id": match.get("id"),
                            "score": float(match.get("score", 0.0)),
                            "source": metadata.get("source", "Clinical Guidance"),
                            "text": text,
                        }
                    )
        except Exception as exc:
            print(f"[Chat Router] Pinecone retrieval failed: {exc}")

    if citations:
        yield json.dumps({"type": "citations", "citations": citations}) + "\n"

    answer = _build_fallback_response(request.query, request.language)
    chunk_size = 70
    for start in range(0, len(answer), chunk_size):
        await asyncio.sleep(0.025)
        yield json.dumps({"type": "token", "content": answer[start : start + chunk_size]}) + "\n"


@router.post("/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(_stream_chat_response(request), media_type="application/x-ndjson")
