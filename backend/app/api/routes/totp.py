"""2FA TOTP (Time-based One-Time Password) endpoints."""
import base64
import io
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import pyotp
import qrcode

from app.api.routes.user import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password
from sqlalchemy.orm import Session


router = APIRouter(prefix="/totp", tags=["2FA"])


class TOTPSetupResponse(BaseModel):
    """Response containing QR code and backup codes."""
    qr_code: str  # Base64 encoded PNG image
    secret: str  # Base32 encoded secret (for manual entry)


class TOTPSetupRequest(BaseModel):
    password: str


class TOTPVerifyRequest(BaseModel):
    """Request to verify and enable 2FA."""
    password: str
    token: str  # 6-digit code from authenticator


class TOTPDisableRequest(BaseModel):
    """Request to disable 2FA."""
    password: str
    token: str  # 6-digit code from authenticator to confirm


class TOTPVerifyWithSecretRequest(BaseModel):
    password: str
    secret: str
    token: str


@router.post("/setup", response_model=TOTPSetupResponse)
def setup_totp(
    request: TOTPSetupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a new TOTP secret and return QR code.
    User must provide their password to initiate setup.
    """
    # Verify password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wachtwoord is onjuist"
        )
    
    # Generate new secret
    secret = pyotp.random_base32()
    
    # Create provisioning URI for Google Authenticator
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="Digital Farm Platform"
    )
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return TOTPSetupResponse(
        qr_code=qr_base64,
        secret=secret
    )


@router.post("/verify")
def verify_and_enable_totp(
    request: TOTPVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Verify TOTP token and enable 2FA.
    The token must be generated from the secret provided in setup.
    """
    # Verify password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wachtwoord is onjuist"
        )
    
    # Get the secret from the request (should be stored temporarily in session/state)
    # For now, we'll accept the secret in a safer way - stored in session
    # This is a simplified version - in production use a session token
    
    # Verify the token matches the secret (secret should come from setup response)
    # The frontend will send the secret back with the token
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Secret not provided in request. Use the QR code from setup endpoint first."
    )


@router.post("/verify-with-secret")
def verify_and_enable_totp_with_secret(
    request: TOTPVerifyWithSecretRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Verify TOTP token with secret and enable 2FA.
    """
    # Verify password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wachtwoord is onjuist"
        )
    
    # Verify token with secret
    totp = pyotp.TOTP(request.secret)
    if not totp.verify(request.token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authenticator code is invalid"
        )
    
    # Save secret and enable 2FA
    current_user.two_factor_secret = request.secret
    current_user.two_factor_enabled = True
    db.add(current_user)
    db.commit()
    
    return {"message": "2FA enabled successfully"}


@router.post("/disable")
def disable_totp(
    request: TOTPDisableRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Disable 2FA. User must provide password and current 2FA token to confirm.
    """
    # Verify password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wachtwoord is onjuist"
        )
    
    # Verify current 2FA token
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled"
        )
    
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(request.token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authenticator code is invalid"
        )
    
    # Disable 2FA
    current_user.two_factor_enabled = False
    current_user.two_factor_secret = None
    db.add(current_user)
    db.commit()
    
    return {"message": "2FA disabled successfully"}


@router.get("/status")
def get_totp_status(
    current_user: User = Depends(get_current_user),
):
    """Get current 2FA status for user."""
    return {
        "two_factor_enabled": current_user.two_factor_enabled,
        "email": current_user.email
    }
