import React, { useState, useEffect } from 'react';
import './Settings.css';
import * as userApi from '../../api/user';
import * as totpApi from '../../api/totp';
import { TwoFactorModal } from './TwoFactorModal';
import { TwoFactorSetupModal } from './TwoFactorSetup';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState<userApi.UserProfile | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showTwoFactorVerify, setShowTwoFactorVerify] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [disableToken, setDisableToken] = useState('');

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
    loadTwoFactorStatus();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const loadTwoFactorStatus = async () => {
    try {
      const data = await totpApi.getTOTPStatus();
      setTwoFactorEnabled(data.two_factor_enabled);
    } catch (err) {
      console.error('Failed to load 2FA status:', err);
    }
  };

  const handleStartTwoFactorSetup = async () => {
    if (!twoFactorPassword) {
      setError('Voer uw wachtwoord in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await totpApi.setupTOTP(twoFactorPassword);
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setShowTwoFactorSetup(true);
      // Keep password for verification step
      // setTwoFactorPassword(''); 
    } catch (err: any) {
      setError(err.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTwoFactor = async (code: string) => {
    if (!secret || !twoFactorPassword) {
      throw new Error('Setup information (password/secret) missing. Please restart setup.');
    }

    setLoading(true);
    setError(null);

    try {
      await totpApi.verifyTOTP(twoFactorPassword, secret, code);
      setSuccess('2FA successfully enabled!');
      setShowTwoFactorSetup(false);
      setQrCode('');
      setSecret('');
      setTwoFactorPassword('');
      setTwoFactorEnabled(true);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!twoFactorPassword) {
      setError('Voer uw wachtwoord in');
      return;
    }
    if (!disableToken) {
      setError('Voer uw authenticator code in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await totpApi.disableTOTP(twoFactorPassword, disableToken);
      setSuccess('2FA successfully disabled!');
      setTwoFactorPassword('');
      setDisableToken('');
      setTwoFactorEnabled(false);
      setShowTwoFactorVerify(false);
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (fullName: string | undefined): string => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await userApi.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        job_title: profile.job_title,
      });
      setProfile(updated);
      setSuccess('Profiel succesvol bijgewerkt!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Nieuwe wachtwoorden komen niet overeen');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Nieuw wachtwoord moet minimaal 6 karakters bevatten');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userApi.updatePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Wachtwoord succesvol bijgewerkt!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Instellingen</h1>
          <p>Beheer uw account en beveiliging</p>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => handleTabChange('account')}
            >
              <span className="nav-icon">👤</span>
              Account
            </button>
            <button
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <span className="nav-icon">🔒</span>
              Beveiliging
            </button>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Informatie</h2>
              {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
              {success && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
              <form onSubmit={handleProfileUpdate}>
                <div className="settings-card">
                  <div className="profile-header">
                    <div className="profile-avatar">{getInitials(profile?.full_name)}</div>
                  </div>
                  
                  <div className="form-group">
                    <label>Volledige Naam</label>
                    <input 
                      type="text" 
                      value={profile?.full_name || ''} 
                      onChange={(e) => setProfile(profile ? { ...profile, full_name: e.target.value } : null)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={profile?.email || ''} 
                      disabled
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Telefoon</label>
                    <input 
                      type="tel" 
                      value={profile?.phone || ''} 
                      onChange={(e) => setProfile(profile ? { ...profile, phone: e.target.value } : null)}
                      placeholder="+31 6 12345678"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Functie</label>
                    <input 
                      type="text" 
                      value={profile?.job_title || ''} 
                      onChange={(e) => setProfile(profile ? { ...profile, job_title: e.target.value } : null)}
                      placeholder="Agro Manager"
                    />
                  </div>
                  
                  <button type="submit" className="save-btn" disabled={loading}>
                    💾 {loading ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Beveiliging</h2>
              {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
              {success && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
              
              <form onSubmit={handlePasswordUpdate}>
                <div className="settings-card">
                  <h3>Wachtwoord Wijzigen</h3>
                  <div className="form-group">
                    <label>Huidig Wachtwoord</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nieuw Wachtwoord</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bevestig Nieuw Wachtwoord</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Bijwerken...' : 'Wachtwoord Bijwerken'}
                  </button>
                </div>
              </form>

              <div className="settings-card">
                <h3>Twee-Factor Authenticatie</h3>
                <p>Beveiliging: Voer extra verificatie in met uw authenticator app</p>
                
                {twoFactorEnabled ? (
                  <div className="security-status enabled">
                    <span className="status-badge">✅ Ingeschakeld</span>
                    <p>Uw account is beveiligd met twee-factor authenticatie.</p>
                    <button
                      type="button"
                      onClick={() => setShowTwoFactorVerify(true)}
                      className="btn-disable-2fa"
                      disabled={loading}
                    >
                      2FA Uitschakelen
                    </button>
                  </div>
                ) : (
                  <div className="security-status disabled">
                    <span className="status-badge">⚠️ Uitgeschakeld</span>
                    <p>Voeg twee-factor authenticatie toe voor betere beveiliging.</p>
                    
                    {!showTwoFactorSetup && (
                      <div className="form-group">
                        <label>Wachtwoord ter Bevestiging</label>
                        <input
                          type="password"
                          placeholder="Voer uw wachtwoord in"
                          value={twoFactorPassword}
                          onChange={(e) => setTwoFactorPassword(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    )}

                    {!showTwoFactorSetup ? (
                      <button
                        type="button"
                        onClick={handleStartTwoFactorSetup}
                        className="btn-enable-2fa"
                        disabled={loading || !twoFactorPassword}
                      >
                        {loading ? 'Bezig...' : '2FA Inschakelen'}
                      </button>
                    ) : null}
                  </div>
                )}

                {/* Disable 2FA Modal */}
                {showTwoFactorVerify && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <h3>Twee-Factor Authenticatie Uitschakelen</h3>
                      <p>Voer uw gegevens in om 2FA uit te schakelen:</p>
                      
                      {error && <div className="error-message">{error}</div>}
                      
                      <div className="form-group">
                        <label>Wachtwoord</label>
                        <input
                          type="password"
                          placeholder="Uw wachtwoord"
                          value={twoFactorPassword}
                          onChange={(e) => setTwoFactorPassword(e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="form-group">
                        <label>Authenticator Code</label>
                        <input
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          value={disableToken}
                          onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
                          disabled={loading}
                        />
                      </div>

                      <div className="modal-actions">
                        <button
                          onClick={() => {
                            setShowTwoFactorVerify(false);
                            setTwoFactorPassword('');
                            setDisableToken('');
                            setError(null);
                          }}
                          className="btn-cancel"
                          disabled={loading}
                        >
                          Annuleren
                        </button>
                        <button
                          onClick={handleDisableTwoFactor}
                          className="btn-danger"
                          disabled={loading || !twoFactorPassword || disableToken.length !== 6}
                        >
                          {loading ? 'Bezig...' : 'Uitschakelen'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      <TwoFactorSetupModal
        isOpen={showTwoFactorSetup}
        qrCode={qrCode}
        secret={secret}
        onVerify={handleVerifyTwoFactor}
        onCancel={() => {
          setShowTwoFactorSetup(false);
          setQrCode('');
          setSecret('');
          setTwoFactorPassword('');
        }}
        loading={loading}
      />
    </div>
  );
};

export default Settings;