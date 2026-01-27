import React, { useState, useEffect } from 'react';
import './Settings.css';
import * as userApi from '../../api/user';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState<userApi.UserProfile | null>(null);
  const [notifications, setNotifications] = useState<userApi.NotificationPreferences>({
    email_project_updates: true,
    email_team_messages: true,
    email_system_updates: false,
    push_browser_notifications: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Load user profile and notifications on mount
  useEffect(() => {
    loadProfile();
    loadNotifications();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await userApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
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

  const handleNotificationToggle = async (key: keyof userApi.NotificationPreferences) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);

    try {
      await userApi.updateNotifications(updated);
    } catch (err) {
      console.error('Failed to update notifications:', err);
      // Revert on error
      setNotifications(notifications);
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
          <p>Beheer uw account en voorkeuren</p>
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
            <button
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              <span className="nav-icon">🔔</span>
              Notificaties
            </button>
            <button
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => handleTabChange('preferences')}
            >
              <span className="nav-icon">⚙️</span>
              Voorkeuren
            </button>
            <button
              className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => handleTabChange('billing')}
            >
              <span className="nav-icon">💳</span>
              Facturering
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

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notificatie Voorkeuren</h2>
              <div className="settings-card">
                <h3>Email Notificaties</h3>
                <div className="toggle-setting">
                  <div>
                    <strong>Projectupdates</strong>
                    <p>Ontvang updates over uw projecten</p>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.email_project_updates}
                      onChange={() => handleNotificationToggle('email_project_updates')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-setting">
                  <div>
                    <strong>Teamberichten</strong>
                    <p>Berichten van teamleden</p>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.email_team_messages}
                      onChange={() => handleNotificationToggle('email_team_messages')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-setting">
                  <div>
                    <strong>Systeemupdates</strong>
                    <p>Belangrijke systeemwijzigingen</p>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.email_system_updates}
                      onChange={() => handleNotificationToggle('email_system_updates')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-card">
                <h3>Push Notificaties</h3>
                <div className="toggle-setting">
                  <span>Browser Notificaties</span>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.push_browser_notifications}
                      onChange={() => handleNotificationToggle('push_browser_notifications')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Voorkeuren</h2>
              <div className="settings-card">
                <h3>Taal & Regio</h3>
                <div className="form-group">
                  <label>Taal</label>
                  <select>
                    <option>Nederlands</option>
                    <option>English</option>
                    <option>Deutsch</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tijdzone</label>
                  <select>
                    <option>Amsterdam (UTC+1)</option>
                    <option>London (UTC+0)</option>
                    <option>New York (UTC-5)</option>
                  </select>
                </div>
              </div>

              <div className="settings-card">
                <h3>Weergave</h3>
                <div className="toggle-setting">
                  <span>Donkere Modus</span>
                  <label className="toggle">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Theme Kleur</label>
                  <div className="color-options">
                    <button className="color-option active" style={{ background: '#4CAF50' }}></button>
                    <button className="color-option" style={{ background: '#2196F3' }}></button>
                    <button className="color-option" style={{ background: '#9C27B0' }}></button>
                    <button className="color-option" style={{ background: '#FF9800' }}></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="settings-section">
              <h2>Facturering & Abonnement</h2>
              <div className="settings-card">
                <div className="plan-info">
                  <h3>Huidig Plan: <span className="plan-badge">Professional</span></h3>
                  <p>€49/maand • Verlengt op 15 Februari 2026</p>
                </div>
                <button className="upgrade-plan-btn">⬆ Upgrade Plan</button>
              </div>

              <div className="settings-card">
                <h3>Betaalmethode</h3>
                <div className="payment-method">
                  <div className="card-info">
                    <span className="card-icon">💳</span>
                    <div>
                      <strong>Visa •••• 4242</strong>
                      <p>Verloopt 12/2027</p>
                    </div>
                  </div>
                  <button className="edit-btn">Bewerken</button>
                </div>
              </div>

              <div className="settings-card">
                <h3>Factuur Geschiedenis</h3>
                <div className="invoice-list">
                  <div className="invoice-item">
                    <div>
                      <strong>Januari 2026</strong>
                      <p>Betaald op 15 Jan 2026</p>
                    </div>
                    <div className="invoice-actions">
                      <span className="invoice-amount">€49.00</span>
                      <button className="download-btn">⬇️ Download</button>
                    </div>
                  </div>
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