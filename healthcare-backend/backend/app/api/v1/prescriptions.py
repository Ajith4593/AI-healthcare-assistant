from __future__ import annotations

import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.broadcaster import publish
from app.database.session import get_db
from app.models.prescription import Prescription
from app.models.user import User

router = APIRouter()


@router.post("/prescriptions", status_code=201)
def upload_prescription(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Basic validation
    suffix = Path(file.filename).suffix.lower()
    if suffix not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not allowed")

    dest_dir = Path(settings.UPLOAD_DIR) / "prescriptions"
    dest_dir.mkdir(parents=True, exist_ok=True)
    file_id = uuid.uuid4()
    dest_name = f"{file_id}_{file.filename}"
    dest_path = dest_dir / dest_name

    try:
        with dest_path.open("wb") as f:
            content = file.file.read()
            f.write(content)
    finally:
        try:
            file.file.close()
        except Exception:
            pass

    pres = Prescription(user_id=current_user.id, filename=file.filename, storage_path=str(dest_path), status="uploaded")
    db.add(pres)
    db.commit()
    db.refresh(pres)

    # Emit realtime event for this user
    publish(current_user.id, {"type": "prescription.uploaded", "id": str(pres.id), "filename": pres.filename, "created_at": pres.created_at.isoformat()})

    return {"id": str(pres.id), "filename": pres.filename, "status": pres.status}


@router.get("/prescriptions", response_model=List[dict])
def list_prescriptions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(Prescription).filter(Prescription.user_id == current_user.id).order_by(Prescription.created_at.desc()).all()
    return [{"id": str(i.id), "filename": i.filename, "status": i.status, "created_at": i.created_at.isoformat()} for i in items]


@router.get("/prescriptions/{pres_id}")
def get_prescription(pres_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pres = db.query(Prescription).filter(Prescription.id == pres_id).first()
    if not pres or pres.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return {"id": str(pres.id), "filename": pres.filename, "status": pres.status, "created_at": pres.created_at.isoformat(), "storage_path": pres.storage_path}
