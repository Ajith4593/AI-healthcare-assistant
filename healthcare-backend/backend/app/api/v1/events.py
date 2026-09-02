from __future__ import annotations

import json
from typing import AsyncIterator

from typing import Optional
from fastapi import APIRouter, Depends, Request, Query, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.security import decode_access_token
from app.database.session import get_db
from sqlalchemy.orm import Session
from app.models.token_blocklist import TokenBlocklist
from app.repositories.user_repository import UserRepository
from app.core.broadcaster import subscribe, unsubscribe
from app.models.user import User

router = APIRouter()


@router.get("/events/stream")
async def event_stream(request: Request, token: Optional[str] = Query(None), db: Session = Depends(get_db)) -> StreamingResponse:
    """Server-Sent Events stream for the authenticated user.

    Accepts token via query param `?token=...` or via standard `Authorization: Bearer ...` header.
    """

    # prefer explicit query param (EventSource cannot set headers reliably)
    auth_token = token
    if not auth_token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            auth_token = auth_header.split(None, 1)[1]

    if not auth_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth token for events stream")

    try:
        payload = decode_access_token(auth_token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token")

    jti = payload.get("jti")
    if jti and db.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).first():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = UserRepository(db).get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")
    q = subscribe(user_id)

    async def generator() -> AsyncIterator[str]:
        try:
            while True:
                ev = await q.get()
                payload = json.dumps(ev)
                yield f"data: {payload}\n\n"
        finally:
            unsubscribe(user_id, q)

    return StreamingResponse(generator(), media_type="text/event-stream")
