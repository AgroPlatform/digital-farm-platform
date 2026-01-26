import React, { useState } from 'react';
import './Analytics.css';

const Analytics: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('month');

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', revenue: 18000, costs: 12000, projects: 8 },
    { month: 'Feb', revenue: 22000, costs: 14000, projects: 10 },
    { month: 'Mar', revenue: 19000, costs: 13000, projects: 9 },
    { month: 'Apr', revenue: 25000, costs: 15000, projects: 12 },
    { month: 'Mei', revenue: 28000, costs: 16000, projects: 14 },
    { month: 'Jun', revenue: 32000, costs: 18000, projects: 15 },
  ];

  const topProjects = [
    { name: 'Agro Analytics Platform', value: 45000, growth: 25, status: 'up' },
    { name: 'Klantenportaal', value: 38000, growth: 18, status: 'up' },
    { name: 'Gewas Monitoring', value: 32000, growth: 12, status: 'up' },
    { name: 'Duurzaamheid Dashboard', value: 28000, growth: -5, status: 'down' },
    { name: 'AI Voorspellingsmodel', value: 24000, growth: 8, status: 'up' },
  ];

  const performanceMetrics = [
    { title: 'Gemiddelde Project Doorlooptijd', value: '45 dagen', change: '-12%', icon: '⏱️', positive: true },
    { title: 'Klanttevredenheid', value: '4.8/5.0', change: '+0.3', icon: '⭐', positive: true },
    { title: 'Team Productiviteit', value: '94%', change: '+5%', icon: '📊', positive: true },
    { title: 'Budget Naleving', value: '87%', change: '-3%', icon: '💰', positive: false },
  ];

  const teamPerformance = [
    { name: 'Development Team', efficiency: 92, projects: 12, avatar: '💻' },
    { name: 'Design Team', efficiency: 88, projects: 8, avatar: '🎨' },
    { name: 'Data Team', efficiency: 95, projects: 6, avatar: '📈' },
    { name: 'Marketing Team', efficiency: 85, projects: 10, avatar: '📢' },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Analytics & Rapportage</h1>
          <p>Gedetailleerde inzichten in prestaties en trends</p>
        </div>
        <div className="time-period-selector">
          <button
            className={`period-btn ${timePeriod === 'week' ? 'active' : ''}`}
            onClick={() => setTimePeriod('week')}
          >
            Week
          </button>
          <button
            className={`period-btn ${timePeriod === 'month' ? 'active' : ''}`}
            onClick={() => setTimePeriod('month')}
          >
            Maand
          </button>
          <button
            className={`period-btn ${timePeriod === 'year' ? 'active' : ''}`}
            onClick={() => setTimePeriod('year')}
          >
            Jaar
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>€165,000</h3>
            <p>Totale Omzet</p>
            <div className="metric-trend positive">
              <span className="trend-icon">↗</span>
              <span>+23% vs vorige periode</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>68</h3>
            <p>Actieve Projecten</p>
            <div className="metric-trend positive">
              <span className="trend-icon">↗</span>
              <span>+15% groei</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>1,248</h3>
            <p>Totaal Gebruikers</p>
            <div className="metric-trend positive">
              <span className="trend-icon">↗</span>
              <span>+12% nieuwe gebruikers</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>87%</h3>
            <p>Voltooiingspercentage</p>
            <div className="metric-trend negative">
              <span className="trend-icon">↘</span>
              <span>-3% deze maand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Revenue Chart */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Omzet & Kosten Overzicht</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot revenue"></span>
                Omzet
              </span>
              <span className="legend-item">
                <span className="legend-dot costs"></span>
                Kosten
              </span>
            </div>
          </div>
          <div className="chart-content">
            <div className="bar-chart">
              {monthlyData.map((data, index) => (
                <div key={index} className="bar-group">
                  <div className="bars">
                    <div
                      className="bar revenue"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                      title={`€${data.revenue.toLocaleString()}`}
                    >
                      <span className="bar-value">€{(data.revenue / 1000).toFixed(0)}k</span>
                    </div>
                    <div
                      className="bar costs"
                      style={{ height: `${(data.costs / maxRevenue) * 100}%` }}
                      title={`€${data.costs.toLocaleString()}`}
                    >
                      <span className="bar-value">€{(data.costs / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Projects */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Projecten</h3>
            <button className="view-all-btn">Bekijk alle →</button>
          </div>
          <div className="top-projects-list">
            {topProjects.map((project, index) => (
              <div key={index} className="project-rank-item">
                <div className="rank-number">#{index + 1}</div>
                <div className="project-info">
                  <h4>{project.name}</h4>
                  <div className="project-value">€{project.value.toLocaleString()}</div>
                </div>
                <div className={`growth-badge ${project.status}`}>
                  {project.status === 'up' ? '↗' : '↘'} {Math.abs(project.growth)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-section">
        <h2>Performance Metrics</h2>
        <div className="performance-grid">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="performance-card">
              <div className="performance-icon">{metric.icon}</div>
              <h4>{metric.title}</h4>
              <div className="performance-value">{metric.value}</div>
              <div className={`performance-change ${metric.positive ? 'positive' : 'negative'}`}>
                {metric.positive ? '↗' : '↘'} {metric.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance */}
      <div className="team-performance-section">
        <h2>Team Performance</h2>
        <div className="team-performance-grid">
          {teamPerformance.map((team, index) => (
            <div key={index} className="team-card">
              <div className="team-header">
                <div className="team-avatar">{team.avatar}</div>
                <div className="team-info">
                  <h4>{team.name}</h4>
                  <p>{team.projects} actieve projecten</p>
                </div>
              </div>
              <div className="efficiency-meter">
                <div className="efficiency-label">
                  <span>Efficiency</span>
                  <span className="efficiency-value">{team.efficiency}%</span>
                </div>
                <div className="efficiency-bar">
                  <div
                    className="efficiency-fill"
                    style={{ width: `${team.efficiency}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <div className="export-card">
          <div className="export-icon">📊</div>
          <div className="export-content">
            <h3>Exporteer Rapport</h3>
            <p>Download een volledig rapport met alle analytics data</p>
          </div>
          <div className="export-buttons">
            <button className="export-btn pdf">
              <span>📄</span> PDF
            </button>
            <button className="export-btn excel">
              <span>📊</span> Excel
            </button>
            <button className="export-btn csv">
              <span>📋</span> CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;