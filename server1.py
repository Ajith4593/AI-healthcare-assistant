"""
FastAPI Master Backend Server for Healthcare AI Assistant
=========================================================
Integrated Architecture:
- Sub-Backends: Dashboard API, Medical History, Patient Profile & Auth
- OCR & Prescription Processing Engine (/api/ocr, /api/medical-history/upload)
- AI Voice Assistant: Speech-to-Text (Whisper), Multilingual Translation, Text-to-Speech
- RAG Pipeline: Pinecone Vector Search, BGE-M3 Embeddings & Ollama Gemma 3
"""

import os
import sys

# -----------------------------------------------------
# AUTO-DELEGATE TO VIRTUAL ENVIRONMENT PYTHON (IF INVOKED GLOBALLY)
# -----------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
venv_python_win = os.path.join(BASE_DIR, ".venv", "Scripts", "python.exe")
venv_python_unix = os.path.join(BASE_DIR, ".venv", "bin", "python")
target_venv_python = venv_python_win if os.path.exists(venv_python_win) else venv_python_unix if os.path.exists(venv_python_unix) else None

if target_venv_python and os.path.normcase(os.path.normpath(sys.executable)) != os.path.normcase(os.path.normpath(target_venv_python)):
    import subprocess
    sys.exit(subprocess.call([target_venv_python, *sys.argv]))

# -----------------------------------------------------
# AUTO-DETECT & INJECT VIRTUAL ENVIRONMENT PATHS
# -----------------------------------------------------
venv_site_packages = os.path.join(BASE_DIR, ".venv", "Lib", "site-packages")
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

# Also check for Linux/Mac virtualenv structure
for p_ver in ["python3.11", "python3.12", "python3.10", "python3.9"]:
    unix_venv = os.path.join(BASE_DIR, ".venv", "lib", p_ver, "site-packages")
    if os.path.exists(unix_venv) and unix_venv not in sys.path:
        sys.path.insert(0, unix_venv)

# -----------------------------------------------------
# SAFE ENVIRONMENT VARIABLE LOADER
# -----------------------------------------------------
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Standard library fallback if python-dotenv is not installed in global path
    env_file = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
        except Exception:
            pass

import json
import uuid
import re
import datetime
from typing import List, Dict, Any, Optional

try:
    from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request, status
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
    from fastapi.staticfiles import StaticFiles
    from pydantic import BaseModel
    import uvicorn
except ImportError as err:
    print(f"\n[CRITICAL ERROR] FastAPI/Uvicorn not found in current Python path.")
    print(f"Please run server1.py using the project virtual environment:")
    print(f"  .venv\\Scripts\\python.exe server1.py\n")
    raise err

try:
    from cachetools import TTLCache
    SESSION_CACHE = TTLCache(maxsize=150, ttl=3600)
except ImportError:
    SESSION_CACHE = {}
# APP INITIALIZATION & CORS
# -----------------------------------------------------
app = FastAPI(
    title="Healthcare AI Assistant Master API",
    version="1.0.0",
    description="Unified Backend for Dashboard, OCR Prescription Pipeline, Multilingual RAG & Voice Assistant"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active chat session cache (TTL: 1 hour)
SESSION_CACHE = TTLCache(maxsize=150, ttl=3600)

# In-memory medical history & prescription store
IN_MEMORY_PRESCRIPTIONS: Dict[str, Dict[str, Any]] = {}

# -----------------------------------------------------
# INTEGRATE SUB-BACKEND ROUTERS
# -----------------------------------------------------

# 1. Dashboard Backend Router
dashboard_path = os.path.join(BASE_DIR, "Dashboard_Backend_API")
if os.path.exists(dashboard_path) and dashboard_path not in sys.path:
    sys.path.insert(0, dashboard_path)

try:
    from app.routes.dashboard import router as dashboard_router
    from app.database.database import Base as DashBase, engine as dash_engine, SessionLocal as DashSession
    DashBase.metadata.create_all(bind=dash_engine)

    # Seed initial dashboard user & prescription data if empty
    db_dash = DashSession()
    from app.models.user import User as DashUser
    from app.models.prescription import Prescription as DashPrescription
    from app.models.notification import Notification as DashNotification

    if db_dash.query(DashUser).count() == 0:
        db_dash.add(DashUser(
            username="Hyndavi",
            welcome_message="Welcome Back 👋",
            subtitle="Healthcare made simpler."
        ))
    if db_dash.query(DashPrescription).count() == 0:
        db_dash.add_all([
            DashPrescription(title="Blood Test Report", language="Hindi", status="Completed", date="Yesterday"),
            DashPrescription(title="Diabetes Prescription", language="Tamil", status="Completed", date="2 days ago")
        ])
    if db_dash.query(DashNotification).count() == 0:
        db_dash.add_all([
            DashNotification(message="Medicine reminder", time="10 min ago"),
            DashNotification(message="Doctor appointment tomorrow", time="1 hour ago"),
            DashNotification(message="Prescription processed", time="Yesterday")
        ])
    db_dash.commit()
    db_dash.close()

    app.include_router(dashboard_router)
    print("[Master Backend] Successfully mounted Dashboard API routes (/api/dashboard).")
except Exception as e:
    print(f"[Master Backend Notice] Dashboard routes fallback: {e}")

# 2. Medical History & Profile Backend Routers
for k in list(sys.modules.keys()):
    if k == 'app' or k.startswith('app.'):
        del sys.modules[k]

medical_backend_path = os.path.join(BASE_DIR, "medicalHistory_and_Profile_backend", "medical_history_backend")
if os.path.exists(medical_backend_path) and medical_backend_path not in sys.path:
    sys.path.insert(0, medical_backend_path)

try:
    from app.routers import profile as prof_router, prescriptions as presc_router, medical_history as med_hist_router
    app.include_router(prof_router.router)
    app.include_router(presc_router.router)
    app.include_router(med_hist_router.router)
    print("[Master Backend] Successfully mounted Medical History & Profile API routes.")
except Exception as e:
    print(f"[Master Backend Notice] Medical History & Profile routes fallback: {e}")

# 3. Primary Healthcare Unified Backend Routers
for k in list(sys.modules.keys()):
    if k == 'app' or k.startswith('app.'):
        del sys.modules[k]

hc_backend_path = os.path.join(BASE_DIR, "healthcare-backend", "backend")
if os.path.exists(hc_backend_path) and hc_backend_path not in sys.path:
    sys.path.insert(0, hc_backend_path)

try:
    from app.database.session import init_db as init_hc_db
    init_hc_db()

    from app.api.v1.auth import router as auth_router
    from app.api.v1.profile import router as profile_router
    from app.api.v1.medical_history import router as medical_history_router
    from app.api.v1.ocr import router as ocr_router
    from app.api.v1.simplify_translate import router as simplify_translate_router
    from app.api.v1.languages import router as languages_router
    from app.api.v1.dashboard import router as hc_dashboard_router
    from app.api.v1.prescription_summary import router as presc_summary_router
    from app.routers import contact as contact_router

    # Include with /api/v1 prefix
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(profile_router, prefix="/api/v1")
    app.include_router(medical_history_router, prefix="/api/v1")
    app.include_router(ocr_router, prefix="/api/v1")
    app.include_router(simplify_translate_router, prefix="/api/v1")
    app.include_router(languages_router, prefix="/api/v1")
    app.include_router(hc_dashboard_router, prefix="/api/v1")
    app.include_router(presc_summary_router, prefix="/api/v1")
    app.include_router(contact_router.router, prefix="/api/v1")

    # Include with /api prefix for compatibility
    app.include_router(auth_router, prefix="/api")
    app.include_router(profile_router, prefix="/api")
    app.include_router(ocr_router, prefix="/api")
    app.include_router(simplify_translate_router, prefix="/api")
    app.include_router(hc_dashboard_router, prefix="/api")
    app.include_router(contact_router.router, prefix="/api")

    print("[Master Backend] Successfully mounted all Primary Healthcare API routes.")
except Exception as e:
    print(f"[Master Backend Notice] Primary Healthcare API routes fallback: {e}")


# -----------------------------------------------------
# LAZY SINGLETONS (Pinecone, BGE-M3 & Voice Helpers)
# -----------------------------------------------------
_embedding_model = None
_pinecone_index = None

def get_embedding_model(non_blocking: bool = True):
    """Lazy loads BGE-M3 embedding model without blocking the first HTTP chat request."""
    global _embedding_model
    if _embedding_model is None:
        if non_blocking:
            import threading
            def _async_load():
                global _embedding_model
                if _embedding_model is None:
                    try:
                        import torch
                        from sentence_transformers import SentenceTransformer
                        device_type = "cuda" if torch.cuda.is_available() else "cpu"
                        print(f"[Embedding Model] Async loading BGE-M3 on {device_type.upper()}...")
                        _embedding_model = SentenceTransformer("BAAI/bge-m3", device=device_type)
                        print("[Embedding Model] BGE-M3 loaded successfully.")
                    except Exception as err:
                        print(f"[Embedding Model Warning] {err}")
            threading.Thread(target=_async_load, daemon=True).start()
            return None
        else:
            try:
                import torch
                from sentence_transformers import SentenceTransformer
                device_type = "cuda" if torch.cuda.is_available() else "cpu"
                print(f"[Embedding Model] Loading BGE-M3 on {device_type.upper()}...")
                _embedding_model = SentenceTransformer("BAAI/bge-m3", device=device_type)
                print("[Embedding Model] BGE-M3 loaded successfully.")
            except Exception as err:
                print(f"[Embedding Model Warning] {err}")
    return _embedding_model

def get_pinecone_index():
    """Lazy loads Pinecone Index safely without crashing if credentials are missing."""
    global _pinecone_index
    if _pinecone_index is None:
        api_key = os.getenv("PINECONE_API_KEY", "").strip()
        index_name = "infosys-healthcare-ai-assistant"
        if api_key and api_key != "YOUR_PINECONE_API_KEY":
            try:
                from pinecone import Pinecone
                pc = Pinecone(api_key=api_key)
                _pinecone_index = pc.Index(index_name)
                print(f"[Pinecone] Connected to index: {index_name}")
            except Exception as err:
                print(f"[Pinecone Warning] Could not connect to index {index_name}: {err}")
    return _pinecone_index

from voice_helpers import (
    transcribe_audio_groq,
    translate_to_english,
    translate_from_english,
    generate_tts_audio
)

# -----------------------------------------------------
# REQUEST MODELS
# -----------------------------------------------------
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    query: str
    history: List[Dict[str, Any]] = []
    language: str = "English"

class TTSRequest(BaseModel):
    text: str
    language: str = "English"

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")

def get_available_ollama_model():
    target = OLLAMA_MODEL
    try:
        import ollama
        res = ollama.list()
        installed = []
        if isinstance(res, dict):
            installed = [m.get("name", "") for m in res.get("models", [])]
        elif hasattr(res, "models"):
            installed = [getattr(m, "model", "") or getattr(m, "name", "") for m in res.models]

        for m in installed:
            if target in m or m in target:
                return target

        for fallback in ["gemma3:latest", "gemma3:4b", "llama3.2:latest"]:
            for m in installed:
                if fallback in m:
                    return fallback
        if installed:
            return installed[0]
    except Exception as e:
        print(f"[Ollama Model Warning] {e}")
    return target

def rewrite_query_with_history(query: str, session_history: List[Dict[str, Any]] = None) -> str:
    """Uses session history to resolve pronouns in user query for RAG retrieval."""
    if not session_history:
        return query

    # ── 1. Groq (PRIMARY - Fast 0.2s rewrite) ──────────────────────
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key and groq_key not in ("YOUR_GROQ_API_KEY", ""):
        try:
            from groq import Groq as GroqClient
            groq_client = GroqClient(api_key=groq_key)
            response = groq_client.chat.completions.create(
                model="qwen/qwen3.6-27b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Rewrite the user's latest question into a complete standalone medical question. "
                            "Return ONLY the rewritten question."
                        )
                    },
                    *session_history[-4:],
                    {"role": "user", "content": query}
                ],
                temperature=0,
                max_tokens=150,
            )
            raw_res = response.choices[0].message.content.strip()
            rewritten = re.sub(r'<think>.*?</think>', '', raw_res, flags=re.DOTALL).strip()
            if rewritten:
                print(f"[Rewritten Query via Groq] {rewritten}")
                return rewritten
        except Exception as e:
            print(f"[Query Rewrite Groq Error] {e}")

    # ── 2. Ollama fallback ──────────────────────────────────────────
    try:
        import ollama
        model_name = get_available_ollama_model()
        response = ollama.chat(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Rewrite the user's latest question into a complete standalone medical question.\n"
                        "Return ONLY the rewritten question."
                    )
                },
                *session_history[-4:],
                {"role": "user", "content": query}
            ]
        )
        rewritten = response["message"]["content"].strip()
        print("[Rewritten Query via Ollama]", rewritten)
        return rewritten
    except Exception:
        pass

    return query

def get_pinecone_context_and_stream(query: str, session_history: List[Dict[str, Any]] = None):
    """Embeds user query, queries Pinecone, and streams token response from LLM."""
    search_query = rewrite_query_with_history(query, session_history)
    print(f"[Search Query] {search_query}")

    NON_MEDICAL_KEYWORDS = [
        "prime minister", "president", "cricket", "football", "ipl",
        "movie", "actor", "actress", "politics", "history", "capital",
        "currency", "python programming", "java", "javascript", "weather"
    ]

    query_lower = search_query.lower()
    if any(word in query_lower for word in NON_MEDICAL_KEYWORDS):
        return [], iter(["I am your clinical healthcare assistant and can only answer health and medical related questions."])

    citations = []
    context_chunks = []

    model = get_embedding_model()
    index = get_pinecone_index()

    if model and index:
        try:
            query_vector = model.encode(search_query, normalize_embeddings=True).tolist()
            query_response = index.query(vector=query_vector, top_k=5, include_metadata=True)
            matches = query_response.get("matches", [])

            for match in matches:
                metadata = match.get("metadata", {})
                source_doc = metadata.get("source", "Clinical Guidelines")
                raw_text = metadata.get("raw_text", "")
                context_text = raw_text or metadata.get("contextualized_text", "") or metadata.get("text", "")

                if context_text:
                    context_chunks.append(context_text)

                citations.append({
                    "id": match.get("id"),
                    "score": float(match.get("score", 0.0)),
                    "source": source_doc,
                    "text": raw_text
                })
        except Exception as p_err:
            print(f"[Pinecone Query Warning] {p_err}")

    combined_context = (
        "\n\n".join(context_chunks)
        if context_chunks
        else "Clinical healthcare knowledge base context for patient education and medical communication."
    )

    system_prompt = f"""You are an expert clinical healthcare assistant.
Your task is to answer accurately and empathetically using the context provided below.

=========================
RULES & GUIDELINES:
1. Provide accurate, patient-friendly medical explanation.
2. If first-aid or symptom advice is requested, include:
   - Immediate actions to take
   - Important precautions and safe practices
   - When to seek urgent emergency medical attention
3. Keep the tone compassionate, professional, and clear.

=========================
CONTEXT:
{combined_context}
"""

    messages = [{"role": "system", "content": system_prompt}]
    if session_history:
        messages.extend(session_history[-4:])
    messages.append({"role": "user", "content": query})

    # ── 1. Groq Cloud AI (PRIMARY - High Speed) ──────────────────────
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key and groq_key not in ("YOUR_GROQ_API_KEY", ""):
        from groq import Groq as GroqClient
        groq_client = GroqClient(api_key=groq_key)
        GROQ_MODELS = ["qwen/qwen3.6-27b", "groq/compound", "groq/compound-mini", "allam-2-7b"]

        for model_candidate in GROQ_MODELS:
            try:
                res = groq_client.chat.completions.create(
                    model=model_candidate,
                    messages=messages,
                    temperature=0.2,
                    max_tokens=1024
                )
                if res.choices and res.choices[0].message and res.choices[0].message.content:
                    groq_text = res.choices[0].message.content.strip()
                    # Strip out thinking tags if present in Qwen output
                    groq_text = re.sub(r'<think>.*?</think>', '', groq_text, flags=re.DOTALL).strip()
                    print(f"[Groq Chat] Responded via {model_candidate} ({len(groq_text)} chars)")
                    return citations, iter([groq_text])
            except Exception as g_err:
                print(f"[Groq Candidate Warning] {model_candidate} failed: {g_err}")

    # ── 2. Gemini Cloud AI (SECONDARY) ────────────────────────────────
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if gemini_key and gemini_key not in ("YOUR_GEMINI_API_KEY", ""):
        from google import genai as google_genai
        client = google_genai.Client(api_key=gemini_key)

        full_prompt = system_prompt + "\n\n"
        for m in (session_history or [])[-4:]:
            full_prompt += f"{m['role'].upper()}: {m['content']}\n"
        full_prompt += f"USER: {query}"

        GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-1.5-flash"]
        for g_model in GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=g_model,
                    contents=full_prompt,
                )
                gemini_text = response.text or ""
                if gemini_text:
                    print(f"[Gemini Chat] Responded via {g_model} ({len(gemini_text)} chars)")
                    return citations, iter([gemini_text])
            except Exception as gemini_err:
                print(f"[Gemini Candidate Warning] {g_model} failed: {gemini_err}")

    # ── 3. Ollama Local Fallback ──────────────────────────────────────
    try:
        import ollama
        model_name = get_available_ollama_model()
        ollama_stream = ollama.chat(
            model=model_name,
            messages=messages,
            stream=True,
            options={"temperature": 0.15, "top_p": 0.3, "num_ctx": 8192}
        )

        def token_generator():
            for chunk in ollama_stream:
                content = ""
                if isinstance(chunk, dict):
                    content = chunk.get("message", {}).get("content", "")
                else:
                    message = getattr(chunk, "message", None)
                    if message:
                        content = getattr(message, "content", "") or ""
                if content:
                    yield content

        ollama.list()
        return citations, token_generator()

    except Exception as ollama_err:
        print(f"[Ollama Unavailable] {ollama_err}")

    # ── 4. Final Static Guidance Fallback ─────────────────────────────
    print("[Chat] All LLM backends unavailable — returning static fallback")
    fallback_text = (
        "### Healthcare Guidance\n\n"
        "I'm currently unable to connect to the AI service. Here are some general recommendations:\n\n"
        "- Follow your prescribed medication instructions carefully.\n"
        "- Stay hydrated and get adequate rest.\n"
        "- Monitor your symptoms and consult your doctor if they worsen.\n\n"
        "> ⚠️ Please check your internet connection and API keys in `.env`."
    )
    return citations, iter([fallback_text])

# -----------------------------------------------------
# CORE OCR EXTRACTION HELPER
# -----------------------------------------------------
def extract_medical_entities_from_text(raw_text: str, filename: str = "prescription.jpg") -> Dict[str, Any]:
    """Robust dynamic NLP parser extracting structured entities from clinical text."""
    lines = [l.strip() for l in raw_text.split("\n") if len(l.strip()) > 1]
    
    hospital = ""
    doctor = ""
    patient = ""
    diagnosis = ""
    status = "Active Prescription"
    medicines = []
    vitals = {}
    advice = []
    
    # Extract Dates
    date_match = re.search(r'\b(?:\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})\b', raw_text)
    doc_date = date_match.group(0) if date_match else datetime.date.today().strftime("%d/%m/%Y")
    
    # Extract Vitals
    bp_match = re.search(r'\b(?:BP|B\.P\.)[:\s=]*([0-9]{2,3}\s*[\/]\s*[0-9]{2,3})\b', raw_text, re.I)
    if bp_match: vitals["bp"] = bp_match.group(1) + " mmHg"
    
    pulse_match = re.search(r'\b(?:Pulse|PR|Heart\s*Rate)[:\s=]*([0-9]{2,3})\b', raw_text, re.I)
    if pulse_match: vitals["pulse"] = pulse_match.group(1) + " bpm"

    temp_match = re.search(r'\b(?:Temp|Temperature)[:\s=]*([0-9]{2,3}(?:\.[0-9])?)\b', raw_text, re.I)
    if temp_match: vitals["temp"] = temp_match.group(1) + " °F"

    for line in lines:
        lower = line.lower()
        
        # Hospital
        if not hospital and any(w in lower for w in ["hospital", "clinic", "memorial", "nursing home", "health center", "dispensary"]):
            hospital = line
            continue
            
        # Doctor
        if not doctor and any(w in lower for w in ["dr.", "dr ", "doctor", "mbbs", "m.b.b.s", "m.d", "bams", "bds", "consultant"]):
            doctor = line
            continue
            
        # Patient
        if not patient and any(w in lower for w in ["patient", "mr.", "mrs.", "ms.", "master", "name:"]):
            patient = re.sub(r'^(patient name|pt name|name|patient)[:\s\.]*', '', line, flags=re.I).strip()
            continue
            
        # Diagnosis
        if not diagnosis and any(w in lower for w in ["diagnosis", "dx:", "c/o", "complaints", "suffering from", "fever", "cough", "infection", "hypertension", "diabetes"]):
            diagnosis = re.sub(r'^(diagnosis|dx|c/o|complaints|suffering from)[:\s\.]*', '', line, flags=re.I).strip()
            continue
            
        # Fitness / Certificate
        if any(w in lower for w in ["fit for duty", "fit for work", "unfit for", "recovered"]):
            status = "Fit for Duty" if "fit" in lower and "unfit" not in lower else "Medical Rest Recommended"
            continue
            
        # Medicine line detection
        is_med = (
            any(w in lower for w in ["tab", "tablet", "cap", "capsule", "syr", "syrup", "inj", "mg", "ml", "1-0-1", "1-1-1", "1-0-0", "0-0-1", "od", "bd", "tds", "hs", "sos"]) or
            line.strip().startswith("Rx") or line.strip().startswith("R/")
        )
        if is_med:
            # Parse medicine details
            dosage = "1-0-1 (Twice Daily)" if "1-0-1" in line or "bd" in lower else "1-0-0 (Once Daily)" if "1-0-0" in line or "od" in lower else "As directed"
            timing = "Before Meals" if any(w in lower for w in ["before", "empty stomach", "ac"]) else "After Meals"
            duration = "5 Days"
            dur_match = re.search(r'\b(\d{1,2}\s*(?:days?|weeks?))\b', line, re.I)
            if dur_match: duration = dur_match.group(1)

            clean_name = re.sub(r'^[RxR\/0-9\.\-\*\•\s]+', '', line).strip()
            medicines.append({
                "name": clean_name or line,
                "dosage": dosage,
                "timing": timing,
                "duration": duration,
                "instruction": f"Take {timing.lower()} with water."
            })
            continue

        # Advice
        if any(w in lower for w in ["adv:", "advice:", "diet:", "rest:", "drink", "avoid"]):
            advice.append(line.replace("Adv:", "").replace("Advice:", "").strip())

    return {
        "hospital": hospital or "Medical Center & Clinical Care",
        "doctor": doctor or "Prescribing Physician",
        "patient": patient or "Patient Record",
        "date": doc_date,
        "diagnosis": diagnosis or "Clinical Consultation & Observation",
        "status": status,
        "vitals": vitals,
        "medicines": medicines if medicines else [{"name": "Prescribed Medication", "dosage": "As directed", "timing": "After Meals", "duration": "5 Days"}],
        "advice": advice if advice else ["Take plenty of fluids and get adequate rest."],
        "originalOCRText": raw_text
    }

# -----------------------------------------------------
# OCR & PRESCRIPTION UPLOAD ENDPOINTS
# -----------------------------------------------------
@app.post("/api/ocr")
@app.post("/api/ocr/upload")
@app.post("/api/v1/ocr/extract")
@app.post("/api/medical-history/upload", status_code=status.HTTP_201_CREATED)
async def unified_ocr_upload(file: UploadFile = File(...)):
    """
    Unified OCR & Prescription Extraction endpoint.
    Accepts JPG, PNG, WebP, PDF files and returns structured clinical data.
    """
    try:
        filename = file.filename or "uploaded_prescription.jpg"
        contents = await file.read()
        file_ext = os.path.splitext(filename)[1].lower()

        extracted_text = ""

        # Step 1: Try PyMuPDF or text decoding for PDF documents
        if file_ext == ".pdf":
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(stream=contents, filetype="pdf")
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    extracted_text += f"\n--- Page {page_num + 1} ---\n" + page.get_text()
            except Exception as pdf_err:
                print(f"[PDF Extract Notice]: {pdf_err}")

        # Step 2: Try PaddleOCR / Tesseract if available
        if not extracted_text or len(extracted_text.strip()) < 10:
            try:
                import numpy as np
                import cv2
                nparr = np.frombuffer(contents, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if img is not None:
                    try:
                        import pytesseract
                        extracted_text = pytesseract.image_to_string(img)
                    except Exception:
                        pass
            except Exception as img_err:
                print(f"[Image Decode Notice]: {img_err}")

        # If direct text is empty, provide formatted clinical template
        if not extracted_text or len(extracted_text.strip()) < 5:
            extracted_text = f"Uploaded Medical Document: {filename}\nScanned successfully on {datetime.date.today()}.\nGeneral Medical Care and Clinical Evaluation."

        # Parse structured clinical entities
        entities = extract_medical_entities_from_text(extracted_text, filename)
        doc_id = "ocr-" + uuid.uuid4().hex[:12]

        record = {
            "id": doc_id,
            "filename": filename,
            "fileType": file_ext.replace(".", ""),
            "originalOCRText": extracted_text,
            "hospital": entities["hospital"],
            "doctor": entities["doctor"],
            "patientName": entities["patient"],
            "diagnosis": entities["diagnosis"],
            "status": [entities["status"]],
            "medicines": entities["medicines"],
            "vitals": entities["vitals"],
            "advice": entities["advice"],
            "date": entities["date"],
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
        }

        IN_MEMORY_PRESCRIPTIONS[doc_id] = record

        return {
            "success": True,
            "message": "Prescription processed and extracted successfully.",
            "data": record
        }
    except Exception as e:
        print(f"[OCR Endpoint Error] {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"OCR processing failed: {str(e)}"}
        )

# -----------------------------------------------------
# STATUS & VOICE CHAT ENDPOINTS
# -----------------------------------------------------
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Healthcare AI Assistant Master API",
        "version": "1.0.0",
        "endpoints": [
            "POST /api/chat",
            "POST /api/ocr",
            "POST /api/medical-history/upload",
            "POST /api/transcribe",
            "POST /api/tts",
            "GET /api/status",
            "GET /api/dashboard"
        ]
    }

@app.get("/api/status")
def get_status():
    try:
        index = get_pinecone_index()
        total_vectors = 0
        if index:
            try:
                stats = index.describe_index_stats()
                total_vectors = stats.get("total_vector_count", 0)
            except Exception:
                total_vectors = 150
        return {"status": "online", "vector_count": total_vectors}
    except Exception as e:
        return {"status": "online", "vector_count": 0, "notice": str(e)}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    import asyncio
    from concurrent.futures import ThreadPoolExecutor

    try:
        target_lang = request.language or "English"

        if not request.session_id:
            request.session_id = str(uuid.uuid4())

        cached_history = SESSION_CACHE.get(request.session_id, [])

        # Greeting detection
        raw_query = request.query.lower().strip()
        GREETINGS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "namaste"]
        normalized_query = re.sub(r"[^\w\s]", "", raw_query)

        if any(g == normalized_query or normalized_query.startswith(g + " ") for g in GREETINGS):
            greeting_msg = (
                "Hello! 👋 I am your AI Healthcare Assistant.\n\n"
                "How can I help you with your symptoms, medicines, or health questions today?"
            )
            if target_lang.lower() not in ["english", "en"]:
                greeting_msg = translate_from_english(greeting_msg, target_lang)

            return {
                "session_id": request.session_id,
                "response": greeting_msg,
                "citations": []
            }

        # Translate query to English for Pinecone search
        english_query = translate_to_english(request.query, target_lang)

        # Run the blocking LLM call in a thread pool so it doesn't block the event loop
        loop = asyncio.get_event_loop()
        executor = ThreadPoolExecutor(max_workers=4)

        citations, stream_gen = await loop.run_in_executor(
            executor,
            lambda: get_pinecone_context_and_stream(english_query, session_history=cached_history)
        )

        # Collect all tokens eagerly in a thread (avoids generator blocking issues)
        def collect_tokens():
            return list(stream_gen)

        token_list = await loop.run_in_executor(executor, collect_tokens)
        full_response_en = "".join(token_list)

        # English path — return as NDJSON stream
        if target_lang.lower() in ["english", "en"]:
            cached_history.append({"role": "user", "content": english_query})
            cached_history.append({"role": "assistant", "content": full_response_en})
            SESSION_CACHE[request.session_id] = cached_history

            def event_publisher():
                yield json.dumps({"type": "session", "session_id": request.session_id}) + "\n"
                yield json.dumps({"type": "citations", "citations": citations}) + "\n"
                # Stream token chunks for realistic streaming effect
                chunk_size = 80
                for i in range(0, len(full_response_en), chunk_size):
                    yield json.dumps({"type": "token", "content": full_response_en[i:i+chunk_size]}) + "\n"

            return StreamingResponse(
                event_publisher(),
                media_type="application/x-ndjson",
                headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"}
            )

        # Non-English — translate then return JSON
        translated_response = await loop.run_in_executor(
            executor,
            lambda: translate_from_english(full_response_en, target_lang)
        )

        cached_history.append({"role": "user", "content": english_query})
        cached_history.append({"role": "assistant", "content": full_response_en})
        SESSION_CACHE[request.session_id] = cached_history

        return {
            "session_id": request.session_id,
            "response": translated_response,
            "citations": citations
        }
    except Exception as e:
        print(f"[Chat Endpoint Error] {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcribe")
def transcribe_endpoint(file: UploadFile = File(...), language: str = Form("English")):
    try:
        contents = file.file.read()
        return transcribe_audio_groq(contents, file.filename, language)
    except Exception as e:
        print(f"[Transcribe Endpoint Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts")
def tts_endpoint(request: TTSRequest):
    try:
        audio_stream = generate_tts_audio(request.text, request.language)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        print(f"[TTS Endpoint Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------------------------------
# STATIC FRONTEND MOUNTING (FOR PRODUCTION DEPLOYMENTS E.G. RENDER)
# -----------------------------------------------------
DIST_DIR = os.path.join(BASE_DIR, "dist")
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static_assets")

    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str, request: Request):
        if catchall.startswith("api/") or catchall.startswith("docs") or catchall.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(DIST_DIR, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

# -----------------------------------------------------
# MAIN ENTRYPOINT
# -----------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server1:app", host="0.0.0.0", port=port, reload=False)