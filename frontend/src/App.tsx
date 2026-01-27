import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from './api/auth';
import client from './api/client';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Weather from './components/pages/Weather';
import SmartPlanner from './components/pages/SmartPlanner';
import Crops from './components/pages/Crops';
import Fields from './components/pages/Fields';
import Settings from './components/pages/Settings';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null);
  
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
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiLogin(email, password);
      console.log('Logged in user:', data);
      setUser({ email: data.email, full_name: data.full_name });
      setIsAuthenticated(true);
      // Clear form
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error('Login failed', err);
      alert(err?.message || 'Login mislukt');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    
    if (registerPassword !== confirmPassword) {
      alert('Wachtwoorden komen niet overeen');
      return;
    }
    
    if (!acceptTerms) {
      alert('U moet akkoord gaan met de algemene voorwaarden');
      return;
    }
    
    setRegisterLoading(true);
    
    try {
      const result = await apiRegister(registerEmail, registerPassword, fullName);
      console.log('Registration successful:', result);
      alert(`Registratie succesvol! U kunt nu inloggen met ${result.email}`);
      // Reset form
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setFullName('');
      setCompany('');
      setAcceptTerms(false);
      // Switch to login tab
      setIsLogin(true);
    } catch (err: any) {
      console.error('Registration failed', err);
      setRegisterError(err?.message || 'Registratie mislukt');
      alert(err?.message || 'Registratie mislukt');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout which will revoke the token and clear the cookie server-side.
      // credentials: 'include' ensures the access_token cookie is sent.
      const res = await client.post('/auth/logout', {});

      if (!res.ok) {
        // Log error but still clear client state to avoid stuck UI
        console.error('Logout failed', await res.text());
      }
    } catch (err) {
      console.error('Logout request error', err);
    }

    // Always clear client-side auth state.
    setIsAuthenticated(false);
    setUser(null);
    // Remove any leftover client cookie just in case (server should clear it).
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  // On app load, validate server-side session (httpOnly cookie) and restore user state if valid.
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const res = await client.get('/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setUser({ email: data.email, full_name: data.full_name });
          setIsAuthenticated(true);
          return;
        }

        // If token invalid/expired, request server to clear cookie and clear client state
        if (res.status === 401) {
          try {
            await client.post('/auth/logout', {});
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error('Auth check failed', err);
      }

      if (!mounted) return;
      setIsAuthenticated(false);
      setUser(null);
      // Client-side attempt to remove cookie (will not affect httpOnly cookie on most browsers).
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // If authenticated, show dashboard with routing
  if (isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="weather" element={<Weather />} />
            <Route path="smart-planner" element={<SmartPlanner />} />
            <Route path="crops" element={<Crops />} />
            <Route path="fields" element={<Fields />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }

  // Otherwise show login/register page
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