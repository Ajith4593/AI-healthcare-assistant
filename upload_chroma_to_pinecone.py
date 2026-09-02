"""
ChromaDB to Pinecone Migration Script
====================================
Extracts embedded chunks and metadata from local ChromaDB store (pdf_vector_db)
and upserts them into the Pinecone Serverless Index (infosys-healthcare-ai-assistant).
"""

import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv(
    "PINECONE_API_KEY",
    "pcsk_6ihmSX_EUVLkXRBLKobgCDEvvxJcngsU7kX41SgTK1xrmd7PDa87i3spYJFpqm1q1ExTf",
)
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "infosys-healthcare-ai-assistant")
CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./pdf_vector_db")


def migrate_chroma_to_pinecone(batch_size: int = 50, dry_run: bool = False):
    """
    Reads all documents, embeddings, and metadata from ChromaDB and
    upserts them into Pinecone DB index.
    """
    print(f"=== ChromaDB to Pinecone Migration ===")
    print(f"Chroma DB Path: {CHROMA_DB_DIR}")
    print(f"Pinecone Index: {INDEX_NAME}")
    print(f"Dry Run Mode:   {dry_run}\n")

    # 1. Initialize ChromaDB Client
    try:
        import chromadb
        chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        collections = chroma_client.list_collections()
        print(f"[ChromaDB] Found {len(collections)} collection(s).")
    except Exception as e:
        print(f"[ChromaDB Error] Failed to initialize ChromaDB client: {e}")
        return False

    if not collections:
        print("[ChromaDB Warning] No collections found in ChromaDB.")
        return False

    # 2. Initialize Pinecone Index if not dry_run
    pinecone_index = None
    if not dry_run:
        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=PINECONE_API_KEY)
            pinecone_index = pc.Index(INDEX_NAME)
            print(f"[Pinecone] Successfully connected to index: {INDEX_NAME}")
        except Exception as e:
            print(f"[Pinecone Error] Failed to connect to Pinecone: {e}")
            return False

    # 3. Process Collections
    total_migrated = 0
    for collection in collections:
        coll_name = collection.name
        print(f"\nProcessing collection: '{coll_name}'")
        
        results = collection.get(include=["embeddings", "documents", "metadatas"])
        ids = results.get("ids", [])
        embeddings = results.get("embeddings")
        documents = results.get("documents", [])
        metadatas = results.get("metadatas", [])

        count = len(ids)
        print(f"Collection '{coll_name}' has {count} item(s).")

        if count == 0:
            continue

        # If embeddings are missing from Chroma collection, generate with BGE-M3
        bge_fn = None
        if embeddings is None or len(embeddings) == 0:
            print("[BGE-M3] Chroma embeddings missing/empty. Generating with BAAI/bge-m3...")
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
            import torch
            device = "cuda" if getattr(torch, "cuda", None) and torch.cuda.is_available() else "cpu"
            bge_fn = SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-m3", device=device)
            embeddings = bge_fn(documents)

        # Batch upsert
        vectors_to_upsert = []
        for i in range(count):
            item_id = ids[i]
            vector = list(embeddings[i]) if embeddings is not None else []
            doc_text = documents[i] if documents and i < len(documents) else ""
            metadata = metadatas[i] if metadatas and i < len(metadatas) else {}
            
            if metadata is None:
                metadata = {}
            
            # Ensure text is included in metadata for RAG retrieval
            if "raw_text" not in metadata and doc_text:
                metadata["raw_text"] = doc_text
            if "source_collection" not in metadata:
                metadata["source_collection"] = coll_name

            vectors_to_upsert.append({
                "id": f"chroma_{coll_name}_{item_id}",
                "values": vector,
                "metadata": metadata
            })

            if len(vectors_to_upsert) >= batch_size or i == count - 1:
                if dry_run:
                    print(f"  [Dry-Run] Would upsert batch of {len(vectors_to_upsert)} vectors.")
                else:
                    try:
                        pinecone_index.upsert(vectors=vectors_to_upsert)
                        print(f"  [Pinecone Upserted] Batch of {len(vectors_to_upsert)} vectors ({i+1}/{count}).")
                    except Exception as upsert_err:
                        print(f"  [Upsert Error] Batch failed: {upsert_err}")
                
                total_migrated += len(vectors_to_upsert)
                vectors_to_upsert = []
                time.sleep(0.1)

    print(f"\nMigration finished. Total vectors processed: {total_migrated}")
    return True


if __name__ == "__main__":
    dry_run_mode = "--dry-run" in sys.argv
    migrate_chroma_to_pinecone(dry_run=dry_run_mode)
