"""Authentication API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, oauth2_scheme
from app.core.i18n import translate
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.token_blocklist import TokenBlocklist
from app.models.user import SUPPORTED_LANGUAGE_CODES, User
from app.schemas.auth import (
    ChangePasswordRequest,
    LanguageUpdateRequest,
    MessageResponse,
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)
from app.services.activity_service import log_audit
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


# -----------------------------
# Register
# -----------------------------
@router.post(
    "/register",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.register(payload)
    log_audit(db, event="register", user_id=str(user.id), detail=f"New {user.role.value} account registered.")
    return user


# -----------------------------
# JSON Login (Frontend)
# -----------------------------
@router.post("/login-json", response_model=TokenResponse)
def login_json(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint for frontend/mobile apps.
    Accepts JSON:
    {
        "email": "...",
        "password": "..."
    }
    """
    service = AuthService(db)
    user = service.authenticate(payload)
    return service.issue_tokens(user)

# Google sign-in endpoint removed: using email/password register/login only


# -----------------------------
# OAuth2 Login (Swagger)
# -----------------------------
@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    OAuth2 Password Flow login used by Swagger Authorize.
    """

    service = AuthService(db)

    payload = UserLoginRequest(
        email=form_data.username,
        password=form_data.password,
    )

    user = service.authenticate(payload)

    return service.issue_tokens(user)


# -----------------------------
# Refresh Token
# -----------------------------
@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.refresh_tokens(payload.refresh_token)


# -----------------------------
# Logout
# -----------------------------
@router.post("/logout", response_model=MessageResponse)
def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke the presented access token by recording its jti in the blocklist.

    The previous implementation was a no-op: it validated the token but
    never invalidated it, so a "logged out" token stayed usable until it
    naturally expired.
    """
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    jti = payload.get("jti")
    exp = payload.get("exp")
    if jti and not db.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).first():
        from datetime import datetime, timezone

        db.add(TokenBlocklist(jti=jti, expires_at=datetime.fromtimestamp(exp, tz=timezone.utc)))
        db.commit()

    return MessageResponse(message=translate("auth.logout_successful"))


# -----------------------------
# Change Password
# -----------------------------
@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    service.change_password(current_user, payload)
    return MessageResponse(message=translate("auth.password_changed"))


# -----------------------------
# Current User Profile
# -----------------------------
@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    # Ensure `phone_number` is a string for the response model to avoid
    # Pydantic response validation errors when DB value is NULL.
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone_number": current_user.phone_number or "",
        "role": current_user.role,
        "is_active": current_user.is_active,
        "preferred_language": current_user.preferred_language,
        "created_at": current_user.created_at,
    }


# -----------------------------
# Language Preference
# -----------------------------
@router.put("/profile/language", response_model=UserProfileResponse)
def update_language(
    payload: LanguageUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Set the user's preferred language (en/ta/kn/te/hi).

    Every module that returns user-facing text (dashboard labels,
    simplified text, OCR results) should read this field to decide
    which language to respond in.
    """
    if payload.preferred_language not in SUPPORTED_LANGUAGE_CODES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported language code. Supported: {list(SUPPORTED_LANGUAGE_CODES)}",
        )
    current_user.preferred_language = payload.preferred_language
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    # immediately apply language for this request's response
    from app.core.i18n import set_language
    set_language(payload.preferred_language)
    return current_user