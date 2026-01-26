import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import './Dashboard.css';

interface LayoutProps {
  onLogout: () => void;
  user: { email: string; full_name?: string } | null;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, user }) => {
  const location = useLocation();
  
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.startsWith('/weather')) return 'weather';
    if (path.startsWith('/smart-planner')) return 'smart-planner';
    if (path.startsWith('/crops')) return 'crops';
    if (path.startsWith('/fields')) return 'fields';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };
  
  const activeMenu = getActiveMenu();

  // Generate initials from user's full name or email
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'JD';
  };

  const getUserName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email;
    return 'Jan de Boer';
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar with Horizontal Navigation */}
      <nav className="navbar-horizontal">
        <div className="navbar-brand">
          <span className="logo-icon">🌱</span>
          <h1 className="logo-text">Agro Dashboard</h1>
        </div>
        
        <div className="navbar-menu">
          <Link 
            to="/dashboard" 
            className={`nav-link ${activeMenu === 'dashboard' ? 'active' : ''}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/weather" 
            className={`nav-link ${activeMenu === 'weather' ? 'active' : ''}`}
          >
            🌤️ Weer
          </Link>
          <Link 
            to="/smart-planner" 
            className={`nav-link ${activeMenu === 'smart-planner' ? 'active' : ''}`}
          >
            🧠 Slimme Planner
          </Link>
          <Link 
            to="/crops" 
            className={`nav-link ${activeMenu === 'crops' ? 'active' : ''}`}
          >
            🌽 Gewassen
          </Link>
          <Link 
            to="/fields" 
            className={`nav-link ${activeMenu === 'fields' ? 'active' : ''}`}
          >
            🌾 Velden
          </Link>
          <Link 
            to="/settings" 
            className={`nav-link ${activeMenu === 'settings' ? 'active' : ''}`}
          >
            ⚙️ Instellingen
          </Link>
        </div>
        
        <div className="navbar-actions">
          <button className="nav-icon" aria-label="Notifications">
            🔔
            <span className="notification-badge">3</span>
          </button>
          <div className="user-profile" onClick={onLogout} style={{ cursor: 'pointer' }} title="Uitloggen">
            <div className="avatar">{getInitials()}</div>
            <div className="user-info">
              <span className="user-name">{getUserName()}</span>
              <span style={{ fontSize: '0.8rem', color: '#636e72' }}>Klik om uit te loggen</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Full Width */}
      <main className="main-content-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
