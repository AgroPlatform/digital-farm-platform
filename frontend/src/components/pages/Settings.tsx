import React, { useState, useEffect } from 'react';
import './Settings.css';
import * as userApi from '../../api/user';

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

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
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
                <p>Extra beveiliging voor uw account (binnenkort beschikbaar)</p>
                <div className="toggle-setting">
                  <span>2FA Inschakelen</span>
                  <label className="toggle">
                    <input type="checkbox" disabled />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;