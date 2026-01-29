import React, { useState } from 'react';
import './TwoFactorSetup.css';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  qrCode?: string; // base64 encoded PNG
  secret?: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  qrCode,
  secret,
  onVerify,
  onCancel,
  loading = false,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      await onVerify(code);
      setCode('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid authenticator code'
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  const copyToClipboard = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="totp-setup-overlay">
      <div className="totp-setup-modal">
        <h2>Set Up Two-Factor Authentication</h2>

        <div className="setup-steps">
          <div className="step">
            <h3>Step 1: Scan QR Code</h3>
            <p>
              Use Google Authenticator, Microsoft Authenticator, or Authy to scan
              this code:
            </p>
            {qrCode ? (
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="2FA QR Code"
                className="qr-code"
              />
            ) : (
              <div className="qr-loading">Loading QR code...</div>
            )}
          </div>

          <div className="step">
            <h3>Step 2: Manual Entry (Optional)</h3>
            <p>Can't scan? Enter this code manually:</p>
            <div className="secret-display">
              <code>{secret || 'Loading...'}</code>
              {secret && (
                <button
                  onClick={copyToClipboard}
                  className="copy-btn"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              )}
            </div>
          </div>

          <div className="step">
            <h3>Step 3: Verify</h3>
            <p>Enter the 6-digit code from your authenticator:</p>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyPress={handleKeyPress}
              className="totp-input"
              disabled={loading}
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6 || !qrCode}
            className="btn-verify"
          >
            {loading ? 'Verifying...' : 'Verify & Enable'}
          </button>
        </div>

        <div className="security-note">
          <strong>Important:</strong> Save your secret key in a safe place. You'll
          need it to recover access if you lose your authenticator.
        </div>
      </div>
    </div>
  );
};
