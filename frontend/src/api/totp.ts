import * as client from './client';

export interface TOTPSetupResponse {
  qr_code: string;
  secret: string;
}

export interface TOTPStatusResponse {
  two_factor_enabled: boolean;
}

export async function getTOTPStatus(): Promise<TOTPStatusResponse> {
  const response = await client.get('/totp/status');
  if (!response.ok) {
    throw new Error('Failed to get 2FA status');
  }
  return response.json();
}

export async function setupTOTP(password: string): Promise<TOTPSetupResponse> {
  const response = await client.post('/totp/setup', { password });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to setup 2FA');
  }
  return response.json();
}

export async function verifyTOTP(password: string, secret: string, token: string): Promise<{ message: string }> {
  const response = await client.post('/totp/verify-with-secret', {
    password,
    secret,
    token,
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to verify TOTP');
  }
  return response.json();
}

export async function disableTOTP(password: string, token: string): Promise<{ message: string }> {
  const response = await client.post('/totp/disable', { password, token });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to disable 2FA');
  }
  return response.json();
}

export async function verifyTOTPLogin(token: string): Promise<{ email: string; full_name: string; two_factor_enabled: boolean; requires_totp: boolean }> {
  const response = await client.post('/auth/verify-totp', { token });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Invalid authenticator code');
  }
  return response.json();
}
