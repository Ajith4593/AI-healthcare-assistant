from __future__ import annotations

from typing import List
from uuid import UUID
from pydantic import BaseModel


class MessagePayload(BaseModel):
    role: str
    content: str
    timestamp: str


class ConversationCreate(BaseModel):
    title: str | None = None
    messages: List[MessagePayload] = []


class ConversationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str | None
    messages: List[MessagePayload]
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True
