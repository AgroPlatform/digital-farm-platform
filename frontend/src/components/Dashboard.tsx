import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  // Statistieken voor agro dashboard
  const stats = [
    { title: 'Totaal Velden', value: '6', change: '+1 dit jaar', icon: '🌾' },
    { title: 'Actieve Gewassen', value: '12', change: '+3 deze maand', icon: '🌽' },
    { title: 'Oppervlakte', value: '28 ha', change: '+5 ha dit jaar', icon: '📏' },
    { title: 'Oogst Status', value: '85%', change: '+12% dit seizoen', icon: '📊' },
  ];

  const recentActivities = [
    { user: 'Systeem', action: 'Weerwaarschuwing: nachtvorst verwacht', time: '2 uur geleden', icon: '🌤️' },
    { user: 'Noord Akker', action: 'Aardappelen plantdatum nadert (15 maart)', time: '5 uur geleden', icon: '🌱' },
    { user: 'Zuid Weide', action: 'Maïs oogst voltooid - 12 ton opbrengst', time: 'Gisteren', icon: '🌾' },
    { user: 'Slimme Planner', action: 'Nieuwe aanbeveling: Bemesting tarwe', time: '2 dagen geleden', icon: '💡' },
  ];

  const fields = [
    { name: 'Noord Akker', size: '5 ha', crop: 'Aardappelen', status: 'Plantfase', progress: 25 },
    { name: 'Zuid Weide', size: '3 ha', crop: 'Maïs', status: 'Geoogst', progress: 100 },
    { name: 'Oost Veld', size: '8 ha', crop: 'Tarwe', status: 'Groei', progress: 60 },
    { name: 'West Perceel', size: '4 ha', crop: 'Uien', status: 'Groei', progress: 45 },
  ];

  const weatherSummary = {
    temp: '14°C',
    condition: 'Zonnig',
    humidity: '65%',
    wind: '12 km/h'
  };

  return (
    <>
      <div className="content-header">
        <h2>Welkom terug, Jan!</h2>
        <p>Vandaag is het {weatherSummary.condition.toLowerCase()}, {weatherSummary.temp} - Perfect weer voor veldwerk.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-change positive">
                {stat.change}
              </span>
            </div>
            <h3 className="stat-value">{stat.value}</h3>
            <p className="stat-title">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Weather Quick View */}
      <div className="content-card" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>🌤️ Huidig Weer</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Boerderij De Groene Akker</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1 }}>{weatherSummary.temp}</div>
            <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>{weatherSummary.condition}</div>
          </div>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px', 
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div>
            <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>💧 Vochtigheid</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{weatherSummary.humidity}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>💨 Wind</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{weatherSummary.wind}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>📅 Voorspelling</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>3 dagen zon</div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="content-grid">
        {/* Left column: Fields Overview */}
        <div className="content-card">
          <div className="card-header">
            <h3>Veld Overzicht</h3>
            <button className="view-all">Bekijk alle →</button>
          </div>
          <div className="projects-list">
            {fields.map((field, index) => (
              <div className="project-item" key={index}>
                <div className="project-info">
                  <h4>{field.name}</h4>
                  <div className="project-meta">
                    <span className="project-status actief">{field.status}</span>
                    <span className="project-team">🌱 {field.crop}</span>
                    <span className="project-team">📏 {field.size}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${field.progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">{field.progress}% groei cyclus</div>
                </div>
                <button className="project-action">📋</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Recent Activity */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recente Updates</h3>
            <button className="view-all">Bekijk alle →</button>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity, index) => (
              <div className="activity-item" key={index}>
                <div className="activity-avatar" style={{ 
                  background: 'linear-gradient(135deg, #4CAF50, #2E7D32)' 
                }}>
                  {activity.icon}
                </div>
                <div className="activity-content">
                  <p>
                    <strong>{activity.user}</strong> - {activity.action}
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section: Quick Actions */}
      <div className="content-card">
        <div className="card-header">
          <h3>Snelle Acties</h3>
        </div>
        <div className="quick-actions">
          <button className="action-button">
            <span className="action-icon">➕</span>
            Nieuw Veld
          </button>
          <button className="action-button">
            <span className="action-icon">🌱</span>
            Gewas Toevoegen
          </button>
          <button className="action-button">
            <span className="action-icon">🌤️</span>
            Weer Bekijken
          </button>
          <button className="action-button">
            <span className="action-icon">🧠</span>
            Slimme Planner
          </button>
          <button className="action-button">
            <span className="action-icon">📊</span>
            Rapporten
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;