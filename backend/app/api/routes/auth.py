from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel, field_validator
import re
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import user as user_model
from app.core import security, jwt as jwt_util
from app.core.config import settings

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


class RegisterResponse(BaseModel):
    email: str
    full_name: str | None = None


@router.post("/register", response_model=RegisterResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(user_model.User).filter(user_model.User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password
    hashed_password = security.hash_password(request.password)
    
    # Create new user
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

    token = jwt_util.create_access_token(user.id)

    # Set secure httpOnly cookie containing the access token. Frontend should use credentials: 'include'.
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.SECURE_COOKIE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return LoginResponse(email=user.email, full_name=user.full_name)
