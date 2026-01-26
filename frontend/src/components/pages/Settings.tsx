import React, { useState } from 'react';
import './Settings.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');

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
              onClick={() => setActiveTab('account')}
            >
              <span className="nav-icon">👤</span>
              Account
            </button>
            <button
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="nav-icon">🔒</span>
              Beveiliging
            </button>
            <button
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="nav-icon">🔔</span>
              Notificaties
            </button>
            <button
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <span className="nav-icon">⚙️</span>
              Voorkeuren
            </button>
            <button
              className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('billing')}
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
              <div className="settings-card">
                <div className="profile-header">
                  <div className="profile-avatar">JD</div>
                  <button className="change-avatar-btn">Wijzig Foto</button>
                </div>
                
                <div className="form-group">
                  <label>Volledige Naam</label>
                  <input type="text" defaultValue="Jan de Boer" />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue="jan.deboer@agro.nl" />
                </div>
                
                <div className="form-group">
                  <label>Telefoon</label>
                  <input type="tel" defaultValue="+31 6 12345678" />
                </div>
                
                <div className="form-group">
                  <label>Functie</label>
                  <input type="text" defaultValue="Agro Manager" />
                </div>
                
                <button className="save-btn">💾 Wijzigingen Opslaan</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Beveiliging</h2>
              <div className="settings-card">
                <h3>Wachtwoord Wijzigen</h3>
                <div className="form-group">
                  <label>Huidig Wachtwoord</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>Nieuw Wachtwoord</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>Bevestig Nieuw Wachtwoord</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button className="save-btn">Wachtwoord Bijwerken</button>
              </div>

              <div className="settings-card">
                <h3>Twee-Factor Authenticatie</h3>
                <p>Extra beveiliging voor uw account</p>
                <div className="toggle-setting">
                  <span>2FA Inschakelen</span>
                  <label className="toggle">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-card">
                <h3>Actieve Sessies</h3>
                <div className="session-item">
                  <div className="session-info">
                    <strong>💻 Windows PC</strong>
                    <p>Amsterdam, Nederland • 2 minuten geleden</p>
                  </div>
                  <button className="danger-btn-small">Uitloggen</button>
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
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-setting">
                  <div>
                    <strong>Teamberichten</strong>
                    <p>Berichten van teamleden</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-setting">
                  <div>
                    <strong>Systeemupdates</strong>
                    <p>Belangrijke systeemwijzigingen</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-card">
                <h3>Push Notificaties</h3>
                <div className="toggle-setting">
                  <span>Browser Notificaties</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
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