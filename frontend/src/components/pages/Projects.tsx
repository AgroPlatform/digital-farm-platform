import React, { useState } from 'react';
import './Projects.css';

const Projects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      id: 1,
      name: 'Agro Analytics Platform',
      description: 'Complete data analytics platform voor agrarische bedrijven',
      progress: 85,
      status: 'actief',
      dueDate: '2026-03-15',
      team: [
        { name: 'Jan Jansen', avatar: 'JJ', role: 'Lead' },
        { name: 'Maria de Vries', avatar: 'MV', role: 'Developer' },
        { name: 'Piet van Dijk', avatar: 'PD', role: 'Designer' },
      ],
      tasks: { total: 45, completed: 38 },
      priority: 'high',
      tags: ['Analytics', 'Dashboard', 'API'],
    },
    {
      id: 2,
      name: 'Gewas Monitoring Systeem',
      description: 'Real-time monitoring van gewassen met IoT sensoren',
      progress: 60,
      status: 'actief',
      dueDate: '2026-04-20',
      team: [
        { name: 'Anna Bakker', avatar: 'AB', role: 'Lead' },
        { name: 'Tom de Groot', avatar: 'TG', role: 'IoT Specialist' },
      ],
      tasks: { total: 32, completed: 19 },
      priority: 'medium',
      tags: ['IoT', 'Monitoring', 'Real-time'],
    },
    {
      id: 3,
      name: 'Voorraadbeheer App',
      description: 'Mobiele app voor voorraad- en logistiekbeheer',
      progress: 30,
      status: 'in ontwikkeling',
      dueDate: '2026-05-10',
      team: [
        { name: 'Lisa Smit', avatar: 'LS', role: 'Mobile Dev' },
        { name: 'Erik Visser', avatar: 'EV', role: 'Backend Dev' },
      ],
      tasks: { total: 28, completed: 8 },
      priority: 'low',
      tags: ['Mobile', 'Logistics', 'Inventory'],
    },
    {
      id: 4,
      name: 'Klantenportaal',
      description: 'Self-service portaal voor klanten en partners',
      progress: 95,
      status: 'bijna voltooid',
      dueDate: '2026-02-28',
      team: [
        { name: 'Sophie Mulder', avatar: 'SM', role: 'Lead' },
        { name: 'David Koning', avatar: 'DK', role: 'Frontend Dev' },
        { name: 'Emma Hendriks', avatar: 'EH', role: 'UX Designer' },
      ],
      tasks: { total: 52, completed: 49 },
      priority: 'high',
      tags: ['Portal', 'Customer Service', 'Web'],
    },
    {
      id: 5,
      name: 'Duurzaamheid Dashboard',
      description: 'Dashboard voor tracking van duurzaamheidsdoelen',
      progress: 45,
      status: 'actief',
      dueDate: '2026-06-15',
      team: [
        { name: 'Rob Peters', avatar: 'RP', role: 'Lead' },
        { name: 'Nina van Leeuwen', avatar: 'NL', role: 'Data Analyst' },
      ],
      tasks: { total: 38, completed: 17 },
      priority: 'medium',
      tags: ['Sustainability', 'Reporting', 'ESG'],
    },
    {
      id: 6,
      name: 'AI Voorspellingsmodel',
      description: 'Machine learning model voor oogstvoorspellingen',
      progress: 20,
      status: 'in ontwikkeling',
      dueDate: '2026-08-30',
      team: [
        { name: 'Alex de Jong', avatar: 'AJ', role: 'ML Engineer' },
      ],
      tasks: { total: 24, completed: 5 },
      priority: 'high',
      tags: ['AI', 'ML', 'Predictions'],
    },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || project.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#636e72';
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Projecten</h1>
          <p>Beheer en monitor al uw actieve projecten</p>
        </div>
        <button className="primary-button">
          <span className="button-icon">➕</span>
          Nieuw Project
        </button>
      </div>

      <div className="projects-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Zoek projecten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle ({projects.length})
          </button>
          <button
            className={`filter-tab ${filter === 'actief' ? 'active' : ''}`}
            onClick={() => setFilter('actief')}
          >
            Actief ({projects.filter(p => p.status === 'actief').length})
          </button>
          <button
            className={`filter-tab ${filter === 'in ontwikkeling' ? 'active' : ''}`}
            onClick={() => setFilter('in ontwikkeling')}
          >
            In Ontwikkeling ({projects.filter(p => p.status === 'in ontwikkeling').length})
          </button>
          <button
            className={`filter-tab ${filter === 'bijna voltooid' ? 'active' : ''}`}
            onClick={() => setFilter('bijna voltooid')}
          >
            Bijna Voltooid ({projects.filter(p => p.status === 'bijna voltooid').length})
          </button>
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-card-header">
              <div className="project-priority" style={{ backgroundColor: getPriorityColor(project.priority) }}>
                {project.priority === 'high' ? '⚡' : project.priority === 'medium' ? '📌' : '✓'}
              </div>
              <button className="project-menu">⋮</button>
            </div>

            <h3 className="project-name">{project.name}</h3>
            <p className="project-description">{project.description}</p>

            <div className="project-tags">
              {project.tags.map((tag, index) => (
                <span key={index} className="project-tag">{tag}</span>
              ))}
            </div>

            <div className="project-progress-section">
              <div className="progress-header">
                <span>Voortgang</span>
                <span className="progress-percentage">{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="project-stats">
              <div className="stat-item">
                <span className="stat-icon">✓</span>
                <span className="stat-text">{project.tasks.completed}/{project.tasks.total} taken</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <span className="stat-text">{new Date(project.dueDate).toLocaleDateString('nl-NL')}</span>
              </div>
            </div>

            <div className="project-team-section">
              <div className="team-avatars">
                {project.team.map((member, index) => (
                  <div key={index} className="team-avatar" title={`${member.name} - ${member.role}`}>
                    {member.avatar}
                  </div>
                ))}
                {project.team.length > 3 && (
                  <div className="team-avatar more">+{project.team.length - 3}</div>
                )}
              </div>
              <span className={`status-badge ${project.status.replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>Geen projecten gevonden</h3>
          <p>Probeer een andere zoekopdracht of filter</p>
        </div>
      )}
    </div>
  );
};

export default Projects;