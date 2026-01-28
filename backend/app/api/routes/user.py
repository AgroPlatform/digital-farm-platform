from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import user as user_model
from app.core import jwt as jwt_util, security
from typing import Optional
from jose import JWTError

router = APIRouter(prefix="/user", tags=["User"])


class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


def get_current_user(request: Request, db: Session = Depends(get_db)) -> user_model.User:
    """Get current user from JWT token cookie."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        payload = jwt_util.decode_access_token(token)
        user_id: str = payload.get("sub")
        jti: str | None = payload.get("jti")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        # Check whether token has been revoked
        if jti and jwt_util.is_jti_revoked(jti, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = db.query(user_model.User).filter(user_model.User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: user_model.User = Depends(get_current_user)):
    """Get current user profile."""
    return UserProfileResponse.model_validate(current_user)


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Update user profile information."""
    if request.full_name is not None:
        current_user.full_name = request.full_name
    if request.phone is not None:
        current_user.phone = request.phone
    if request.job_title is not None:
        current_user.job_title = request.job_title
    
    db.commit()
    db.refresh(current_user)
    
    return UserProfileResponse.model_validate(current_user)


@router.put("/password")
def update_password(
    request: UpdatePasswordRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Update user password."""
    # Verify current password
    if not security.verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash and update new password
    current_user.hashed_password = security.hash_password(request.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}



