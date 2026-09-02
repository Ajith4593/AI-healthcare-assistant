from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel


class Prescription(BaseModel):
    __tablename__ = "prescriptions"

    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="uploaded", nullable=False)
    analysis_result: Mapped[str | None] = mapped_column(Text, nullable=True)
