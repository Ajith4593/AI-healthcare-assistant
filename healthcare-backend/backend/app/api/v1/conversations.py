from __future__ import annotations

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.broadcaster import publish
from app.database.session import get_db
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
    MessagePayload,
)

router = APIRouter()


@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    payload: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = Conversation(user_id=current_user.id, title=payload.title or None, messages=json.dumps([m.dict() for m in payload.messages]))
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Emit realtime event for conversation creation
    publish(current_user.id, {"type": "conversation.created", "id": str(conv.id), "title": conv.title, "created_at": conv.created_at.isoformat()})
    return _to_response(conv)


@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.updated_at.desc()).all()
    return [_to_response(c) for c in convs]


@router.get("/conversations/{conv_id}", response_model=ConversationResponse)
def get_conversation(conv_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return _to_response(conv)


@router.post("/conversations/{conv_id}/messages", response_model=ConversationResponse)
def append_message(conv_id: str, message: MessagePayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    try:
        msgs = json.loads(conv.messages)
    except Exception:
        msgs = []
    msgs.append(message.dict())
    conv.messages = json.dumps(msgs)
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Emit realtime event for conversation update (new message)
    publish(current_user.id, {"type": "conversation.updated", "id": str(conv.id), "updated_at": conv.updated_at.isoformat(), "message": {"role": message.role, "content": message.content}})

    return _to_response(conv)


def _to_response(conv: Conversation) -> ConversationResponse:
    try:
        messages = json.loads(conv.messages)
    except Exception:
        messages = []
    return ConversationResponse(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        messages=messages,
        created_at=conv.created_at.isoformat(),
        updated_at=conv.updated_at.isoformat(),
    )
