"""
app/core/i18n_middleware.py — Language detection middleware.

Detects the user's preferred language from incoming requests using the
following priority (first match wins):

  1. Query parameter  ?lang=hi
  2. X-Language header
  3. Accept-Language header (first value only)
  4. Default: English (en)

JWT-based language injection is handled separately in app/api/deps.py
via get_current_user, which sets the language context after token
validation so authenticated users always get their saved preference.
"""
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.i18n import SUPPORTED_I18N_CODES, set_language


class I18nMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        lang = _detect_language(request)
        set_language(lang)
        response = await call_next(request)
        response.headers["Content-Language"] = lang
        return response


def _detect_language(request: Request) -> str:
    # 1. Query parameter
    lang = request.query_params.get("lang", "").strip().lower()
    if lang in SUPPORTED_I18N_CODES:
        return lang

    # 2. Custom header
    lang = request.headers.get("X-Language", "").strip().lower()
    if lang in SUPPORTED_I18N_CODES:
        return lang

    # 3. Accept-Language (use only the first tag, strip region subtags)
    accept = request.headers.get("Accept-Language", "")
    for tag in accept.split(","):
        code = tag.strip().split(";")[0].split("-")[0].lower()
        if code in SUPPORTED_I18N_CODES:
            return code

    return "en"
