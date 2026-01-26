import React, { useState } from 'react';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, rememberMe });
    alert('Login functionaliteit wordt later geïmplementeerd voor het agro platform.');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      alert('Wachtwoorden komen niet overeen');
      return;
    }
    console.log('Register attempt:', { registerEmail, registerPassword, fullName, company, acceptTerms });
    alert('Registratie functionaliteit wordt later geïmplementeerd voor het agro platform.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Agro Platform</h1>
          <p className="login-subtitle">
            {isLogin ? 'Welkom terug bij uw agro management systeem' : 'Maak een account aan voor het agro platform'}
          </p>
        </div>

        <div className="form-toggle">
          <button 
            className={`toggle-button ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Inloggen
          </button>
          <button 
            className={`toggle-button ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Registreren
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">E-mailadres</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="voer uw e-mailadres in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Wachtwoord</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="voer uw wachtwoord in"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className="remember-label">Onthoud mij</label>
              </div>
              <a href="#" className="forgot-password">Wachtwoord vergeten?</a>
            </div>

            <button type="submit" className="login-button">Inloggen</button>

            <p className="toggle-link">
              Nog geen account? <button type="button" className="toggle-link-button" onClick={() => setIsLogin(false)}>Registreer hier</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Volledige naam</label>
              <input
                type="text"
                id="fullName"
                className="form-input"
                placeholder="voer uw volledige naam in"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company" className="form-label">Bedrijfsnaam (optioneel)</label>
              <input
                type="text"
                id="company"
                className="form-input"
                placeholder="voer uw bedrijfsnaam in"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerEmail" className="form-label">E-mailadres</label>
              <input
                type="email"
                id="registerEmail"
                className="form-input"
                placeholder="voer uw e-mailadres in"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerPassword" className="form-label">Wachtwoord</label>
              <input
                type="password"
                id="registerPassword"
                className="form-input"
                placeholder="kies een sterk wachtwoord"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Bevestig wachtwoord</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                placeholder="herhaal uw wachtwoord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <label htmlFor="acceptTerms" className="remember-label">
                  Ik ga akkoord met de <a href="#" className="terms-link">algemene voorwaarden</a>
                </label>
              </div>
            </div>

            <button type="submit" className="login-button">Account aanmaken</button>

            <p className="toggle-link">
              Al een account? <button type="button" className="toggle-link-button" onClick={() => setIsLogin(true)}>Log hier in</button>
            </p>
          </form>
        )}

        <div className="login-footer">
          <p className="footer-text">© 2025 Agro Platform. Alle rechten voorbehouden.</p>
          <p className="footer-links">
            <a href="#">Privacybeleid</a> • <a href="#">Algemene voorwaarden</a> • <a href="#">Contact</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;