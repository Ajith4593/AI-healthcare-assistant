"""
app/main.py — Unified FastAPI application entrypoint.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.api.v1.auth import router as auth_router
# chat_router intentionally NOT imported here.
# The real /api/chat endpoint (with full Pinecone RAG + Ollama/Groq streaming)
# lives in server1.py. Importing chat_router here would double-register a
# stub-only fallback and shadow the real implementation when server1.py
# mounts these sub-routers.
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.languages import router as languages_router
from app.api.v1.medical_history import router as medical_history_router
from app.api.v1.ocr import router as ocr_router
from app.api.v1.profile import router as profile_router
from app.api.v1.simplify_translate import router as simplify_translate_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.prescriptions import router as prescriptions_router
from app.api.v1.events import router as events_router

# ⭐ NEW
from app.api.v1.prescription_summary import (
    router as prescription_summary_router,
)

from app.core.config import settings
from app.core.exception_handlers import register_exception_handlers
from app.core.i18n_middleware import I18nMiddleware
from app.core.logging_config import configure_logging
from app.database.session import close_db, init_db
from app.routers import contact, health
from fastapi.staticfiles import StaticFiles

configure_logging(debug=settings.ENV != "production", log_dir=settings.LOG_DIR)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("%s starting (env=%s)...", settings.APP_NAME, settings.ENV)
    init_db()
    logger.info("Database ready at %s", settings.DATABASE_URL)
    yield
    logger.info("Shutting down %s...", settings.APP_NAME)
    close_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description=(
        "Unified backend for the AI-Powered Healthcare Communication Assistant "
        "for Rural Communities."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Language detection must run before route handlers
app.add_middleware(I18nMiddleware)

register_exception_handlers(app)

# Landing Page
app.include_router(health.router)
app.include_router(contact.router)

API_PREFIX = f"/api/{settings.API_VERSION}"

# Existing Routers
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(profile_router, prefix=API_PREFIX)
app.include_router(medical_history_router, prefix=API_PREFIX)
app.include_router(ocr_router, prefix=API_PREFIX)
app.include_router(simplify_translate_router, prefix=API_PREFIX)
app.include_router(languages_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
# chat_router excluded — see import comment above.

# ⭐ NEW Prescription Summary Router
app.include_router(
    prescription_summary_router,
    prefix=API_PREFIX,
)

# Conversations router (user-scoped chat persistence)
app.include_router(conversations_router, prefix=API_PREFIX)
app.include_router(prescriptions_router, prefix=API_PREFIX)
app.include_router(events_router, prefix=API_PREFIX)

WORKSPACE_ROOT = Path(__file__).resolve().parents[3]
FRONTEND_DIST = WORKSPACE_ROOT / "dist"

# Serve built frontend static assets when present
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Serve a few top-level static files referenced by the built HTML
    top_level_files = [
        "favicon.svg",
        "sw.js",
        "registerSW.js",
        "manifest.webmanifest",
        "workbox-9c191d2f.js",
        "icons.svg",
    ]

    for _fname in top_level_files:
        _path = FRONTEND_DIST / _fname
        if _path.exists():
            def _make_route(path):
                return lambda: FileResponse(path)

            # create a simple route function bound to the file path
            route_fn = _make_route(_path)
            app.get(f"/{_fname}", include_in_schema=False)(route_fn)


@app.get("/", include_in_schema=False)
def root():
    if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
        return FileResponse(FRONTEND_DIST / "index.html")
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "status": "running",
        "docs": "/docs",
        "api_prefix": API_PREFIX,
    }


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi"):
        raise HTTPException(status_code=404, detail="Not found")

    if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
        return FileResponse(FRONTEND_DIST / "index.html")

    raise HTTPException(status_code=404, detail="Frontend build not found")