from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from pydantic import BaseModel, field_validator
import re
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import user as user_model
from app.core import security, jwt as jwt_util
from app.core.config import settings
from app.db import models as db_models
from jose import JWTError
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str | None = None

    @field_validator('email')
    def validate_email(cls, v):
        # Simple email regex
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid email format')
        return v


class LoginResponse(BaseModel):
    email: str
    full_name: str | None = None
    two_factor_enabled: bool = False
    requires_totp: bool = False  # If True, frontend should show 2FA verification screen


class RegisterResponse(BaseModel):
    email: str
    full_name: str | None = None


@router.post("/register", response_model=RegisterResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(user_model.User).filter(
        user_model.User.email == request.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # 🔴 PASSWORD CHECK
    if not security.validate_password(request.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long and include upper, lower, number and special character"
        )

    hashed_password = security.hash_password(request.password)

    new_user = user_model.User(
        email=request.email,
        hashed_password=hashed_password,
        full_name=request.full_name,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return RegisterResponse(email=new_user.email, full_name=new_user.full_name)


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter(user_model.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not security.verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # If user has 2FA enabled, don't set the main token yet
    # Frontend should redirect to 2FA verification
    if user.two_factor_enabled:
        # Create a temporary token for 2FA verification (valid for 5 minutes)
        temp_token = jwt_util.create_access_token(user.id, expires_minutes=5)
        response.set_cookie(
            key="totp_challenge_token",
            value=temp_token,
            httponly=True,
            secure=settings.SECURE_COOKIE or settings.COOKIE_SAMESITE == "none",
            samesite=settings.COOKIE_SAMESITE,
            max_age=5 * 60,
        )
        return LoginResponse(
            email=user.email,
            full_name=user.full_name,
            two_factor_enabled=True,
            requires_totp=True
        )

    # Normal login without 2FA
    token = jwt_util.create_access_token(user.id)
    same_site = settings.COOKIE_SAMESITE
    secure_cookie = settings.SECURE_COOKIE or same_site == "none"

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite=same_site,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return LoginResponse(
        email=user.email,
        full_name=user.full_name,
        two_factor_enabled=False,
        requires_totp=False
    )


class TOTPVerifyRequest(BaseModel):
    token: str  # 6-digit code from authenticator


@router.post("/verify-totp", response_model=LoginResponse)
def verify_totp(request: TOTPVerifyRequest, challenge_request: Request, response: Response, db: Session = Depends(get_db)):
    """Verify TOTP token after successful password login."""
    import pyotp
    
    # Get the temporary challenge token from cookie
    challenge_token = challenge_request.cookies.get("totp_challenge_token")
    if not challenge_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No 2FA challenge in progress. Please login first."
        )
    
    try:
        payload = jwt_util.decode_access_token(challenge_token)
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired 2FA challenge token"
        )
    
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user or not user.two_factor_enabled or not user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="2FA not properly configured"
        )
    
    # Verify TOTP token
    totp = pyotp.TOTP(user.two_factor_secret)
    if not totp.verify(request.token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticator code"
        )
    
    # 2FA verified, create main access token
    token = jwt_util.create_access_token(user.id)
    same_site = settings.COOKIE_SAMESITE
    secure_cookie = settings.SECURE_COOKIE or same_site == "none"
    
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite=same_site,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    # Clear challenge token
    response.delete_cookie("totp_challenge_token", samesite=same_site, secure=secure_cookie)
    
    return LoginResponse(
        email=user.email,
        full_name=user.full_name,
        two_factor_enabled=True,
        requires_totp=False
    )


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    """Logout current user by revoking the token jti and clearing the cookie."""
    token = request.cookies.get("access_token")
    if token:
        try:
            payload = jwt_util.decode_access_token(token)
            jti = payload.get("jti")
            if jti:
                # mark jti as revoked
                revoked = db_models.RevokedToken(jti=jti, revoked_at=datetime.utcnow())
                db.add(revoked)
                db.commit()
        except JWTError:
            # If token invalid we still proceed to clear cookie
            pass

    # Clear the cookie in the response so browser drops it
    same_site = settings.COOKIE_SAMESITE
    secure_cookie = settings.SECURE_COOKIE or same_site == "none"
    response.delete_cookie("access_token", samesite=same_site, secure=secure_cookie)
    return {"message": "Logged out"}
