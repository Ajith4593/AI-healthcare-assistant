"""
JSON Full Dataset Importer to Pinecone DB
==========================================
Imports healthcare datasets (JSON / TXT), applies text splitting, generates
BGE-M3 embeddings, and batch upserts vectors + metadata into Pinecone DB.
"""

import os
import sys
import json
import glob
import time
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv(
    "PINECONE_API_KEY",
    "pcsk_6ihmSX_EUVLkXRBLKobgCDEvvxJcngsU7kX41SgTK1xrmd7PDa87i3spYJFpqm1q1ExTf",
)
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "infosys-healthcare-ai-assistant")


def load_dataset_file(filepath: str) -> List[Dict[str, Any]]:
    """Loads a JSON dataset file containing medical records or documentation."""
    if not os.path.exists(filepath):
        print(f"[Dataset Warning] File not found: {filepath}")
        return []
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
    except Exception as e:
        print(f"[Dataset Error] Failed to parse JSON {filepath}: {e}")
    return []


def upload_dataset_to_pinecone(json_filepath: str = None, batch_size: int = 50, dry_run: bool = False):
    """
    Splits, embeds, and uploads structured medical datasets into Pinecone DB.
    """
    print(f"=== Full Dataset Batch Importer to Pinecone ===")
    print(f"Index Name: {INDEX_NAME}")
    print(f"Dry Run:    {dry_run}\n")

    # 1. Discover JSON files if no specific filepath provided
    files_to_process = []
    if json_filepath:
        files_to_process.append(json_filepath)
    else:
        files_to_process = glob.glob("*.json") + glob.glob("data/*.json")

    print(f"Found {len(files_to_process)} dataset file(s) to process.")

    # 2. Text Splitter & Embedding Model
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
    import torch

    text_splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ". ", "? ", "! ", " "],
        chunk_size=1000,
        chunk_overlap=300
    )

    device = "cuda" if getattr(torch, "cuda", None) and torch.cuda.is_available() else "cpu"
    print(f"[BGE-M3] Initializing embedding model on device: {device}...")
    embedding_fn = SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-m3", device=device)

    # 3. Connect to Pinecone
    pinecone_index = None
    if not dry_run:
        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=PINECONE_API_KEY)
            pinecone_index = pc.Index(INDEX_NAME)
            print(f"[Pinecone] Connected to index: {INDEX_NAME}")
        except Exception as e:
            print(f"[Pinecone Error] Failed to connect: {e}")
            return False

    # 4. Process Each File
    total_inserted = 0
    for file_path in files_to_process:
        print(f"\nProcessing dataset file: {file_path}")
        records = load_dataset_file(file_path)
        if not records:
            continue

        file_basename = os.path.basename(file_path)
        chunks_to_upsert = []

        for idx, rec in enumerate(records):
            content = rec.get("content") or rec.get("text") or rec.get("description") or json.dumps(rec)
            title = rec.get("title") or rec.get("medicine") or f"Record {idx}"
            category = rec.get("category") or rec.get("specialty") or "General Medicine"

            # Split content into chunks
            sub_chunks = text_splitter.split_text(content)
            for chunk_i, chunk_text in enumerate(sub_chunks):
                chunks_to_upsert.append({
                    "id": f"dataset_{file_basename}_{idx}_{chunk_i}",
                    "text": chunk_text,
                    "metadata": {
                        "source": file_basename,
                        "title": str(title),
                        "category": str(category),
                        "raw_text": chunk_text
                    }
                })

        print(f"Generated {len(chunks_to_upsert)} text chunk(s) from {file_path}.")

        # Generate Embeddings & Upsert in Batches
        for i in range(0, len(chunks_to_upsert), batch_size):
            batch = chunks_to_upsert[i:i + batch_size]
            batch_texts = [item["text"] for item in batch]
            batch_vectors = embedding_fn(batch_texts)

            vector_records = []
            for j, item in enumerate(batch):
                vector_records.append({
                    "id": item["id"],
                    "values": list(batch_vectors[j]),
                    "metadata": item["metadata"]
                })

            if dry_run:
                print(f"  [Dry-Run] Prepared batch of {len(vector_records)} vectors.")
            else:
                try:
                    pinecone_index.upsert(vectors=vector_records)
                    print(f"  [Pinecone Upserted] Batch of {len(vector_records)} vectors ({i + len(batch)}/{len(chunks_to_upsert)}).")
                except Exception as u_err:
                    print(f"  [Upsert Error] Failed: {u_err}")

            total_inserted += len(vector_records)
            time.sleep(0.1)

    print(f"\nDataset Import Finished. Total vectors processed: {total_inserted}")
    return True


if __name__ == "__main__":
    filepath_arg = None
    dry_run_mode = "--dry-run" in sys.argv
    for arg in sys.argv[1:]:
        if not arg.startswith("--") and os.path.exists(arg):
            filepath_arg = arg
            break

    upload_dataset_to_pinecone(json_filepath=filepath_arg, dry_run=dry_run_mode)
