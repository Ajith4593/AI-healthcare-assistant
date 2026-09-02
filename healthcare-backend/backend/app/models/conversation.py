from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel


class Conversation(BaseModel):
    """Simple conversation record storing messages as JSON text.

    For local/dev simplicity we store the messages list as JSON text in
    `messages` column. Each message is expected to be a dict with keys
    like `role`, `content`, and `timestamp`.
    """

    __tablename__ = "conversations"

    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    title: Mapped[str | None] = mapped_column(nullable=True)
    messages: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
