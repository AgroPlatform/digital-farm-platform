import React, { useState } from 'react';
import './Team.css';

const Team: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const teamMembers = [
    {
      id: 1,
      name: 'Jan de Boer',
      role: 'Agro Manager',
      department: 'Management',
      email: 'jan.deboer@agro.nl',
      phone: '+31 6 12345678',
      avatar: 'JB',
      status: 'online',
      projects: 8,
      tasks: 24,
      completion: 87,
      skills: ['Management', 'Strategy', 'Leadership'],
      bgColor: '#4CAF50',
    },
    {
      id: 2,
      name: 'Maria de Vries',
      role: 'Senior Developer',
      department: 'Development',
      email: 'maria.devries@agro.nl',
      phone: '+31 6 87654321',
      avatar: 'MV',
      status: 'online',
      projects: 5,
      tasks: 18,
      completion: 92,
      skills: ['React', 'TypeScript', 'Node.js'],
      bgColor: '#2196F3',
    },
    {
      id: 3,
      name: 'Piet van Dijk',
      role: 'UX/UI Designer',
      department: 'Design',
      email: 'piet.vandijk@agro.nl',
      phone: '+31 6 23456789',
      avatar: 'PD',
      status: 'away',
      projects: 6,
      tasks: 15,
      completion: 78,
      skills: ['Figma', 'UI Design', 'Prototyping'],
      bgColor: '#9C27B0',
    },
    {
      id: 4,
      name: 'Anna Bakker',
      role: 'Data Analyst',
      department: 'Analytics',
      email: 'anna.bakker@agro.nl',
      phone: '+31 6 34567890',
      avatar: 'AB',
      status: 'online',
      projects: 4,
      tasks: 12,
      completion: 95,
      skills: ['Python', 'SQL', 'Data Viz'],
      bgColor: '#FF9800',
    },
    {
      id: 5,
      name: 'Tom de Groot',
      role: 'IoT Specialist',
      department: 'Technology',
      email: 'tom.degroot@agro.nl',
      phone: '+31 6 45678901',
      avatar: 'TG',
      status: 'offline',
      projects: 3,
      tasks: 9,
      completion: 65,
      skills: ['IoT', 'Hardware', 'Sensors'],
      bgColor: '#f44336',
    },
    {
      id: 6,
      name: 'Lisa Smit',
      role: 'Mobile Developer',
      department: 'Development',
      email: 'lisa.smit@agro.nl',
      phone: '+31 6 56789012',
      avatar: 'LS',
      status: 'online',
      projects: 4,
      tasks: 16,
      completion: 88,
      skills: ['React Native', 'Swift', 'Kotlin'],
      bgColor: '#00BCD4',
    },
    {
      id: 7,
      name: 'Erik Visser',
      role: 'Backend Developer',
      department: 'Development',
      email: 'erik.visser@agro.nl',
      phone: '+31 6 67890123',
      avatar: 'EV',
      status: 'away',
      projects: 7,
      tasks: 21,
      completion: 82,
      skills: ['Java', 'Spring', 'Docker'],
      bgColor: '#3F51B5',
    },
    {
      id: 8,
      name: 'Sophie Mulder',
      role: 'Project Manager',
      department: 'Management',
      email: 'sophie.mulder@agro.nl',
      phone: '+31 6 78901234',
      avatar: 'SM',
      status: 'online',
      projects: 12,
      tasks: 35,
      completion: 90,
      skills: ['Scrum', 'Agile', 'Jira'],
      bgColor: '#E91E63',
    },
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = ['Alle', 'Management', 'Development', 'Design', 'Analytics', 'Technology'];
  const [selectedDepartment, setSelectedDepartment] = useState('Alle');

  const departmentFiltered = selectedDepartment === 'Alle'
    ? filteredMembers
    : filteredMembers.filter(m => m.department === selectedDepartment);

  return (
    <div className="team-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Team Leden</h1>
          <p>Beheer en bekijk al uw teamleden en hun prestaties</p>
        </div>
        <button className="primary-button">
          <span className="button-icon">➕</span>
          Voeg Lid Toe
        </button>
      </div>

      <div className="team-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Zoek teamleden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="department-filter">
          {departments.map(dept => (
            <button
              key={dept}
              className={`dept-btn ${selectedDepartment === dept ? 'active' : ''}`}
              onClick={() => setSelectedDepartment(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid weergave"
          >
            ⊞
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Lijst weergave"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="team-stats">
        <div className="stat-box">
          <div className="stat-icon">👥</div>
          <div>
            <h3>{teamMembers.length}</h3>
            <p>Totaal Teamleden</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon online">🟢</div>
          <div>
            <h3>{teamMembers.filter(m => m.status === 'online').length}</h3>
            <p>Online</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">📊</div>
          <div>
            <h3>{Math.round(teamMembers.reduce((acc, m) => acc + m.completion, 0) / teamMembers.length)}%</h3>
            <p>Gem. Voltooiing</p>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">📁</div>
          <div>
            <h3>{teamMembers.reduce((acc, m) => acc + m.projects, 0)}</h3>
            <p>Actieve Projecten</p>
          </div>
        </div>
      </div>

      <div className={`team-members ${viewMode}`}>
        {departmentFiltered.map(member => (
          <div key={member.id} className="member-card">
            <div className="member-status-indicator" data-status={member.status}></div>
            
            <div className="member-header">
              <div className="member-avatar" style={{ background: member.bgColor }}>
                {member.avatar}
              </div>
              <div className="status-badge" data-status={member.status}>
                {member.status === 'online' ? '🟢' : member.status === 'away' ? '🟡' : '⚫'}
                {member.status}
              </div>
            </div>

            <div className="member-info">
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <span className="department-badge">{member.department}</span>
            </div>

            <div className="member-contact">
              <div className="contact-item">
                <span className="icon">📧</span>
                <span>{member.email}</span>
              </div>
              <div className="contact-item">
                <span className="icon">📱</span>
                <span>{member.phone}</span>
              </div>
            </div>

            <div className="member-skills">
              {member.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>

            <div className="member-stats">
              <div className="stat">
                <span className="stat-label">Projecten</span>
                <span className="stat-value">{member.projects}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Taken</span>
                <span className="stat-value">{member.tasks}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Voltooiing</span>
                <span className="stat-value">{member.completion}%</span>
              </div>
            </div>

            <div className="completion-bar">
              <div className="completion-fill" style={{ width: `${member.completion}%` }}></div>
            </div>

            <div className="member-actions">
              <button className="action-btn" title="Bekijk profiel">👤</button>
              <button className="action-btn" title="Stuur bericht">✉️</button>
              <button className="action-btn" title="Meer opties">⋮</button>
            </div>
          </div>
        ))}
      </div>

      {departmentFiltered.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">👥</div>
          <h3>Geen teamleden gevonden</h3>
          <p>Probeer een andere zoekopdracht of filter</p>
        </div>
      )}
    </div>
  );
};

export default Team;