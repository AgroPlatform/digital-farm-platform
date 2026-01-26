import React, { useState } from 'react';
import './Documents.css';

const Documents: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');

  const documents = [
    { id: 1, name: 'Project Plan 2026.pdf', type: 'pdf', size: '2.4 MB', modified: '2026-01-25', folder: 'Projects', icon: '📄' },
    { id: 2, name: 'Financial Report Q4.xlsx', type: 'excel', size: '1.8 MB', modified: '2026-01-24', folder: 'Finance', icon: '📊' },
    { id: 3, name: 'Team Photos.zip', type: 'zip', size: '15.2 MB', modified: '2026-01-23', folder: 'Media', icon: '🗜️' },
    { id: 4, name: 'Design Mockups.fig', type: 'figma', size: '5.6 MB', modified: '2026-01-22', folder: 'Design', icon: '🎨' },
    { id: 5, name: 'Meeting Notes.docx', type: 'word', size: '245 KB', modified: '2026-01-21', folder: 'Documents', icon: '📝' },
    { id: 6, name: 'Presentation.pptx', type: 'powerpoint', size: '8.3 MB', modified: '2026-01-20', folder: 'Presentations', icon: '📽️' },
    { id: 7, name: 'Database Backup.sql', type: 'sql', size: '120 MB', modified: '2026-01-19', folder: 'Technical', icon: '💾' },
    { id: 8, name: 'Logo Assets.ai', type: 'illustrator', size: '3.2 MB', modified: '2026-01-18', folder: 'Design', icon: '🖼️' },
    { id: 9, name: 'Contract Agreement.pdf', type: 'pdf', size: '890 KB', modified: '2026-01-17', folder: 'Legal', icon: '📄' },
    { id: 10, name: 'Marketing Strategy.pptx', type: 'powerpoint', size: '6.7 MB', modified: '2026-01-16', folder: 'Marketing', icon: '📽️' },
    { id: 11, name: 'User Research.csv', type: 'csv', size: '1.2 MB', modified: '2026-01-15', folder: 'Research', icon: '📋' },
    { id: 12, name: 'App Screenshots.zip', type: 'zip', size: '22.5 MB', modified: '2026-01-14', folder: 'Media', icon: '🗜️' },
  ];

  const folders = ['all', ...new Set(documents.map(d => d.folder))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || doc.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: '#ff4757',
      excel: '#2ed573',
      word: '#2196F3',
      powerpoint: '#ff9800',
      zip: '#9C27B0',
      figma: '#00BCD4',
      sql: '#3F51B5',
      illustrator: '#FF6B6B',
      csv: '#4CAF50',
    };
    return colors[type] || '#636e72';
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Documenten</h1>
          <p>Beheer en organiseer al uw bestanden en documenten</p>
        </div>
        <div className="header-actions">
          <button className="secondary-button">
            <span className="button-icon">📤</span>
            Upload
          </button>
          <button className="primary-button">
            <span className="button-icon">📁</span>
            Nieuwe Map
          </button>
        </div>
      </div>

      <div className="storage-info-card">
        <div className="storage-icon">💾</div>
        <div className="storage-details">
          <div className="storage-text">
            <h3>32.5 GB</h3>
            <p>van 50 GB gebruikt</p>
          </div>
          <div className="storage-bar">
            <div className="storage-fill" style={{ width: '65%' }}></div>
          </div>
        </div>
        <button className="upgrade-btn">⬆ Upgrade</button>
      </div>

      <div className="documents-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Zoek documenten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="folder-filters">
          {folders.map(folder => (
            <button
              key={folder}
              className={`folder-btn ${selectedFolder === folder ? 'active' : ''}`}
              onClick={() => setSelectedFolder(folder)}
            >
              📁 {folder === 'all' ? 'Alle' : folder}
            </button>
          ))}
        </div>

        <div className="view-actions">
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
          <select className="sort-select">
            <option>Naam (A-Z)</option>
            <option>Naam (Z-A)</option>
            <option>Datum (Nieuw-Oud)</option>
            <option>Datum (Oud-Nieuw)</option>
            <option>Grootte (Klein-Groot)</option>
            <option>Grootte (Groot-Klein)</option>
          </select>
        </div>
      </div>

      <div className="documents-stats">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div>
            <h4>{documents.length}</h4>
            <p>Totaal Bestanden</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div>
            <h4>8</h4>
            <p>Deze Week</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div>
            <h4>12</h4>
            <p>Favorieten</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🗑️</div>
          <div>
            <h4>3</h4>
            <p>Recent Verwijderd</p>
          </div>
        </div>
      </div>

      <div className={`documents-grid ${viewMode}`}>
        {filteredDocuments.map(doc => (
          <div key={doc.id} className="document-card">
            <div className="document-icon" style={{ background: getTypeColor(doc.type) }}>
              {doc.icon}
            </div>
            <div className="document-info">
              <h4>{doc.name}</h4>
              <div className="document-meta">
                <span className="doc-size">{doc.size}</span>
                <span className="doc-date">📅 {doc.modified}</span>
              </div>
              <span className="doc-folder">📁 {doc.folder}</span>
            </div>
            <div className="document-actions">
              <button className="doc-action-btn" title="Download">⬇️</button>
              <button className="doc-action-btn" title="Delen">🔗</button>
              <button className="doc-action-btn" title="Meer">⋮</button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">📄</div>
          <h3>Geen documenten gevonden</h3>
          <p>Probeer een andere zoekopdracht of filter</p>
        </div>
      )}

      <div className="recent-activity">
        <h3>Recente Activiteit</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📤</div>
            <div className="activity-details">
              <p><strong>Maria de Vries</strong> heeft <strong>Project Plan 2026.pdf</strong> geüpload</p>
              <span className="activity-time">2 uur geleden</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">✏️</div>
            <div className="activity-details">
              <p><strong>Piet van Dijk</strong> heeft <strong>Design Mockups.fig</strong> bewerkt</p>
              <span className="activity-time">5 uur geleden</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🔗</div>
            <div className="activity-details">
              <p><strong>Jan de Boer</strong> heeft <strong>Financial Report Q4.xlsx</strong> gedeeld</p>
              <span className="activity-time">1 dag geleden</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;