"""
Unit tests for BGE-M3 Embeddings & RAG Vector Pipeline functions
"""

import pytest
import re


def clean_medical_text(text: str) -> str:
    """Helper function matching bge_ingest cleaning rules."""
    text = re.sub(r'(\w+)-\n\s*(\w+)', r'\1\2', text)
    text = re.sub(r'Page\s*\|\s*\d+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\d+\s+P\s*RINCIPLES\s+OF\s+FOOD\s+SANITATION', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()


def test_clean_medical_text():
    raw_input = "Hypertension-\nmanagement Page | 12 1 P RINCIPLES OF FOOD SANITATION high blood pressure"
    cleaned = clean_medical_text(raw_input)
    assert "Hypertensionmanagement" in cleaned
    assert "Page | 12" not in cleaned
    assert "P RINCIPLES OF FOOD SANITATION" not in cleaned


def test_text_splitter_logic():
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ". ", "? ", "! ", " "], 
        chunk_size=1000,       
        chunk_overlap=300
    )
    sample_text = "Paragraph one.\n\nParagraph two with detailed clinical information about medication."
    chunks = text_splitter.split_text(sample_text)
    assert len(chunks) >= 1
    assert text_splitter._chunk_size == 1000
    assert text_splitter._chunk_overlap == 300
