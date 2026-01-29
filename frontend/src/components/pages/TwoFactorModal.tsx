import React, { useState } from 'react';
import '../pages/TwoFactorModal.css';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onVerify,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(code);
      setCode('');
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid authenticator code'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="two-factor-modal-overlay">
      <div className="two-factor-modal">
        <h2>Two-Factor Authentication</h2>
        <p>Enter the 6-digit code from your authenticator app</p>

        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          onKeyPress={handleKeyPress}
          className="totp-input"
          autoFocus
          disabled={loading}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="modal-actions">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="btn-verify"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};
