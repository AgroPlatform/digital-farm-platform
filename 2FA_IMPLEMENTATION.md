# Two-Factor Authentication (2FA) Implementation

## Overview
The Digital Farm Platform now includes Two-Factor Authentication (2FA) using Time-based One-Time Password (TOTP) with Google Authenticator, Microsoft Authenticator, or Authy.

## Features
- ✅ TOTP-based 2FA with QR code generation
- ✅ Password verification for setup/disable
- ✅ Google Authenticator compatibility
- ✅ Manual secret entry option
- ✅ 2FA status endpoint
- ✅ Login flow integration
- ✅ Settings page UI for 2FA management

## Backend Implementation

### Dependencies Added
- `pyotp==2.9.0` - TOTP generation and verification
- `qrcode==7.4.2` - QR code generation
- `Pillow==10.1.0` - Image processing

### Database Schema
User model extended with:
- `two_factor_enabled: Boolean (default: False)` - Whether 2FA is enabled
- `two_factor_secret: String (nullable)` - Base32 encoded TOTP secret

### API Endpoints

#### 1. POST /api/totp/setup
Initiates 2FA setup and returns QR code.

**Request:**
```json
{
  "password": "user_password"
}
```

**Response:**
```json
{
  "qr_code": "iVBORw0KGgoAAAANS...",  // Base64 encoded PNG
  "secret": "JBSWY3DPEBLW64TMMQ6="      // Base32 encoded for manual entry
}
```

#### 2. POST /api/totp/verify-with-secret
Verifies TOTP code and enables 2FA.

**Request:**
```json
{
  "password": "user_password",
  "secret": "JBSWY3DPEBLW64TMMQ6=",
  "token": "123456"
}
```

**Response:**
```json
{
  "message": "2FA successfully enabled"
}
```

#### 3. POST /api/totp/disable
Disables 2FA (requires password confirmation).

**Request:**
```json
{
  "password": "user_password",
  "token": "123456"
}
```

**Response:**
```json
{
  "message": "2FA successfully disabled"
}
```

#### 4. GET /api/totp/status
Returns current 2FA status.

**Response:**
```json
{
  "two_factor_enabled": true
}
```

### Modified Auth Endpoints

#### POST /api/auth/login
Enhanced login flow:
- Verifies email and password
- Checks if user has 2FA enabled
- If 2FA disabled: Returns normal login response with `access_token` cookie
- If 2FA enabled: Returns temporary `totp_challenge_token` cookie (5-minute expiry) and `requires_totp=true`

**Response with 2FA required:**
```json
{
  "email": "user@example.com",
  "full_name": "User Name",
  "two_factor_enabled": true,
  "requires_totp": true
}
```

#### POST /api/auth/verify-totp
Completes 2FA login challenge.

**Request:**
```json
{
  "token": "123456"
}
```

**Response (on success):**
```json
{
  "email": "user@example.com",
  "full_name": "User Name",
  "two_factor_enabled": true,
  "requires_totp": false
}
```

Sets main `access_token` cookie and clears `totp_challenge_token`.

## Frontend Implementation

### Components Created

#### TwoFactorModal.tsx
Modal for entering 2FA code during login.
- Accepts 6-digit code input
- Auto-formats numeric input
- Enter key support for verification
- Error handling and loading states

#### TwoFactorSetupModal.tsx
Complete 2FA setup wizard.
- Displays QR code (as base64 image)
- Shows manual entry secret
- Copy-to-clipboard for secret
- Verification code input
- Security note about backup secret

### Updated Components

#### App.tsx
- Added 2FA state management (`requiresTOTP`, `totpEmail`)
- Implemented `handleVerifyTOTP` function
- Integrated `TwoFactorModal` display
- Modified `handleLoginSubmit` to handle 2FA requirement

#### Settings.tsx (Security Tab)
- 2FA status display (enabled/disabled)
- Password verification for setup
- `handleStartTwoFactorSetup` function calls `/api/totp/setup`
- `handleVerifyTwoFactor` function calls `/api/totp/verify-with-secret`
- `handleDisableTwoFactor` function calls `/api/totp/disable`
- Modal for 2FA disable confirmation

### API Types

Added to `frontend/src/api/auth.ts`:
```typescript
interface LoginResponse {
  email: string;
  full_name: string;
  two_factor_enabled: boolean;
  requires_totp: boolean;
}
```

## User Flow

### 1. Enabling 2FA
1. User navigates to Settings → Security tab
2. Clicks "2FA Inschakelen" button
3. Enters password for verification
4. `TwoFactorSetupModal` displays:
   - QR code to scan with authenticator app
   - Manual secret entry option with copy button
   - 6-digit code input field
5. User scans QR code with authenticator app
6. User enters 6-digit code from app
7. Backend verifies code and enables 2FA
8. UI shows "2FA Ingeschakeld" status

### 2. Logging In with 2FA
1. User enters email and password
2. If 2FA not enabled: Normal login, redirected to dashboard
3. If 2FA enabled:
   - Backend returns `requires_totp=true`
   - Frontend shows `TwoFactorModal`
   - User enters 6-digit code from authenticator
   - Frontend calls `/api/auth/verify-totp`
   - On success: Sets access token, redirected to dashboard

### 3. Disabling 2FA
1. User navigates to Settings → Security tab
2. Clicks "2FA Uitschakelen" button
3. Confirmation modal appears
4. Enters password
5. Backend verifies password and disables 2FA

## Testing

### Backend Testing
```bash
# Start the backend
cd backend
python -m uvicorn app.main:app --reload

# Test endpoints with curl or Postman
# 1. Login normally (2FA disabled)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# 2. Setup 2FA
curl -X POST http://localhost:8000/api/totp/setup \
  -H "Content-Type: application/json" \
  -b "access_token=YOUR_TOKEN" \
  -d '{"password": "password"}'

# 3. Verify 2FA code
curl -X POST http://localhost:8000/api/totp/verify-with-secret \
  -H "Content-Type: application/json" \
  -b "access_token=YOUR_TOKEN" \
  -d '{"password": "password", "secret": "SECRET_FROM_SETUP", "token": "123456"}'

# 4. Login with 2FA
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# 5. Verify TOTP code from login
curl -X POST http://localhost:8000/api/auth/verify-totp \
  -H "Content-Type: application/json" \
  -b "totp_challenge_token=YOUR_TEMP_TOKEN" \
  -d '{"token": "123456"}'
```

### Frontend Testing
1. **Enable 2FA:**
   - Go to Settings → Security
   - Enter password and click "2FA Inschakelen"
   - Scan QR code with Google Authenticator
   - Enter code and verify

2. **Login with 2FA:**
   - Logout
   - Enter credentials
   - Enter code from authenticator when prompted
   - Verify successful login

3. **Disable 2FA:**
   - Go to Settings → Security
   - Click "2FA Uitschakelen"
   - Enter password
   - Verify 2FA is disabled

## Security Notes
- ✅ Passwords verified server-side for all 2FA operations
- ✅ Temporary tokens (5-minute expiry) used for 2FA challenge
- ✅ Secrets stored encrypted in database
- ✅ TOTP codes validated using industry standard pyotp library
- ✅ QR codes generated client-side only (not stored)
- ⚠️ Recommend users save backup secret in secure location
- ⚠️ Recovery codes not yet implemented (future enhancement)

## Future Enhancements
- [ ] Backup codes for account recovery
- [ ] FIDO2/WebAuthn support
- [ ] SMS-based 2FA fallback
- [ ] Device trust/remember this device
- [ ] 2FA enforcement policies
- [ ] Audit logs for 2FA events

## Files Modified/Created

### Backend
- `backend/app/models/user.py` - Added 2FA columns
- `backend/app/api/routes/totp.py` - NEW: Complete TOTP endpoints
- `backend/app/api/routes/auth.py` - Modified login flow for 2FA
- `backend/app/main.py` - Registered TOTP router
- `backend/requirements.txt` - Added pyotp, qrcode, Pillow

### Frontend
- `frontend/src/App.tsx` - Added 2FA state and logic
- `frontend/src/components/pages/Settings.tsx` - 2FA management UI
- `frontend/src/components/pages/TwoFactorModal.tsx` - NEW: 2FA verification modal
- `frontend/src/components/pages/TwoFactorModal.css` - NEW: Modal styles
- `frontend/src/components/pages/TwoFactorSetup.tsx` - NEW: Setup wizard
- `frontend/src/components/pages/TwoFactorSetup.css` - NEW: Setup styles
- `frontend/src/components/pages/Settings.css` - Added 2FA styles

## Troubleshooting

### "Invalid authenticator code"
- Ensure device time is synchronized (TOTP is time-sensitive)
- QR code should be scanned within reasonable time window
- Some authenticators allow multiple codes at boundary

### "No 2FA challenge in progress"
- Session may have expired (5-minute window)
- Try logging in again

### "2FA not properly configured"
- User record missing 2FA secret
- Check database for corrupt data

### QR code not displaying
- Check browser console for errors
- Verify base64 encoding from backend
- Try manual secret entry instead

## References
- [PyOTP Documentation](https://pyauth.github.io/pyotp/)
- [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238)
- [QR Code Standard](https://www.qr-code.com/)
