import React, { useState } from 'react';
import './SmartPlanner.css';

const SmartPlanner: React.FC = () => {
  const [recommendations, setRecommendations] = useState([
    { 
      id: 1, 
      type: 'planten', 
      crop: 'Aardappelen', 
      field: 'Noord Akker', 
      reason: 'Bodemtemperatuur is 8°C - perfect voor aardappelen', 
      priority: 'hoog',
      date: '15 Maart 2024',
      impact: 'Verhoogt opbrengst met 15%'
    },
    { 
      id: 2, 
      type: 'bemesten', 
      crop: 'Tarwe', 
      field: 'Zuid Weide', 
      reason: 'Stikstofgehalte is laag (2.5%) - bemesting nodig', 
      priority: 'medium',
      date: '20 Maart 2024',
      impact: 'Verbetert groei en kwaliteit'
    },
    { 
      id: 3, 
      type: 'oogsten', 
      crop: 'Maïs', 
      field: 'Oost Veld', 
      reason: 'Rijpheidsgraad bereikt 95% - optimale oogsttijd', 
      priority: 'hoog',
      date: '25 Juli 2024',
      impact: 'Maximale opbrengst behouden'
    },
    { 
      id: 4, 
      type: 'bewateren', 
      crop: 'Suikerbieten', 
      field: 'West Perceel', 
      reason: 'Droogte verwacht komende week - preventief bewateren', 
      priority: 'laag',
      date: '10 April 2024',
      impact: 'Voorkomt stress bij gewassen'
    },
    { 
      id: 5, 
      type: 'rotatie', 
      crop: 'Gerst', 
      field: 'Noord Akker', 
      reason: 'Bodemuitputting voorkomen - wisselteelt aanbevolen', 
      priority: 'medium',
      date: '1 September 2024',
      impact: 'Bodemgezondheid verbeteren'
    },
    { 
      id: 6, 
      type: 'bescherming', 
      crop: 'Uien', 
      field: 'Midden Land', 
      reason: 'Schimmelwaarschuwing - preventieve behandeling', 
      priority: 'hoog',
      date: '5 Mei 2024',
      impact: 'Voorkomt gewasverlies'
    },
  ]);

  const [aiInsights, setAiInsights] = useState([
    {
      id: 1,
      title: 'Optimale plantdatum',
      description: 'Beste tijd voor aardappelen: 15-25 maart',
      confidence: 92,
      icon: '📅'
    },
    {
      id: 2,
      title: 'Waterbesparing',
      description: 'Beregening kan met 20% worden verminderd',
      confidence: 85,
      icon: '💧'
    },
    {
      id: 3,
      title: 'Bodemverbetering',
      description: 'Organisch materiaal toevoegen voor betere structuur',
      confidence: 78,
      icon: '🌱'
    },
    {
      id: 4,
      title: 'Plaagpreventie',
      description: 'Natuurlijke vijanden introduceren voor bladluis',
      confidence: 90,
      icon: '🐞'
    },
  ]);

  const [selectedRec, setSelectedRec] = useState<number | null>(1);
  const [filter, setFilter] = useState('all');

  const filteredRecs = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.priority === filter);

  const selectedRecData = recommendations.find(rec => rec.id === selectedRec);

  const applyRecommendation = (id: number) => {
    alert(`Aanbeveling ${id} wordt toegepast en gepland`);
    // In een echte app zou hier API call komen
  };

  const scheduleRecommendation = (id: number) => {
    alert(`Aanbeveling ${id} wordt ingepland voor later`);
    // In een echte app zou hier planning functionaliteit komen
  };

  const generateNewRecommendations = () => {
    alert('Nieuwe AI-aanbevelingen worden gegenereerd...');
    // In een echte app zou hier AI call komen
  };

  return (
    <div className="smart-planner-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🧠 Slimme Planner</h1>
          <p>AI-gestuurde aanbevelingen voor optimale landbouwplanning</p>
        </div>
        <button className="primary-button" onClick={generateNewRecommendations}>
          <span className="button-icon">✨</span>
          Nieuwe Inzichten
        </button>
      </div>

      <div className="planner-stats">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{recommendations.filter(r => r.priority === 'hoog').length}</h3>
            <p>Hoge Prioriteit</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{recommendations.length}</h3>
            <p>Totaal Aanbevelingen</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>92%</h3>
            <p>AI Accuraatheid</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>15%</h3>
            <p>Opbrengst Verbetering</p>
          </div>
        </div>
      </div>

      <div className="planner-grid">
        {/* Recommendations List */}
        <div className="recommendations-list-card">
          <div className="card-header">
            <h3>✨ Slimme Aanbevelingen</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Alle
              </button>
              <button 
                className={`filter-btn ${filter === 'hoog' ? 'active' : ''}`}
                onClick={() => setFilter('hoog')}
              >
                🔥 Hoog
              </button>
              <button 
                className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
                onClick={() => setFilter('medium')}
              >
                ⚠️ Medium
              </button>
              <button 
                className={`filter-btn ${filter === 'laag' ? 'active' : ''}`}
                onClick={() => setFilter('laag')}
              >
                ℹ️ Laag
              </button>
            </div>
          </div>
          <div className="recommendations-list">
            {filteredRecs.map(rec => (
              <div 
                key={rec.id} 
                className={`recommendation-item ${selectedRec === rec.id ? 'selected' : ''}`}
                onClick={() => setSelectedRec(rec.id)}
              >
                <div className="rec-header">
                  <div className="rec-type-icon">
                    {rec.type === 'planten' ? '🌱' : 
                     rec.type === 'bemesten' ? '🧪' : 
                     rec.type === 'oogsten' ? '🌾' : 
                     rec.type === 'bewateren' ? '💧' : 
                     rec.type === 'rotatie' ? '🔄' : '🛡️'}
                  </div>
                  <div className="rec-title">
                    <h4>{rec.type.charAt(0).toUpperCase() + rec.type.slice(1)} {rec.crop}</h4>
                    <span className="rec-field">🌾 {rec.field}</span>
                  </div>
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority === 'hoog' ? '🔥' : rec.priority === 'medium' ? '⚠️' : 'ℹ️'}
                  </span>
                </div>
                <div className="rec-content">
                  <p>{rec.reason}</p>
                </div>
                <div className="rec-footer">
                  <span className="rec-date">📅 {rec.date}</span>
                  <div className="rec-actions">
                    <button 
                      className="action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRecommendation(rec.id);
                      }}
                    >
                      Toepassen
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        scheduleRecommendation(rec.id);
                      }}
                    >
                      Plannen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Recommendation Details */}
        <div className="recommendation-details-card">
          <h3>📋 Aanbeveling Details</h3>
          {selectedRecData ? (
            <div className="rec-detail-content">
              <div className="rec-header-large">
                <div className="rec-type-icon-large">
                  {selectedRecData.type === 'planten' ? '🌱' : 
                   selectedRecData.type === 'bemesten' ? '🧪' : 
                   selectedRecData.type === 'oogsten' ? '🌾' : 
                   selectedRecData.type === 'bewateren' ? '💧' : 
                   selectedRecData.type === 'rotatie' ? '🔄' : '🛡️'}
                </div>
                <div className="rec-title-large">
                  <h2>{selectedRecData.type.charAt(0).toUpperCase() + selectedRecData.type.slice(1)} {selectedRecData.crop}</h2>
                  <div className="rec-meta">
                    <span className="rec-field-large">🌾 {selectedRecData.field}</span>
                    <span className={`priority-large ${selectedRecData.priority}`}>
                      {selectedRecData.priority === 'hoog' ? 'Hoge prioriteit' : 
                       selectedRecData.priority === 'medium' ? 'Medium prioriteit' : 
                       'Lage prioriteit'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rec-info-grid">
                <div className="info-item">
                  <span className="info-label">Aanbevolen datum</span>
                  <span className="info-value">{selectedRecData.date}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Verwachte impact</span>
                  <span className="info-value highlight">{selectedRecData.impact}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Prioriteit</span>
                  <span className={`info-value ${selectedRecData.priority}`}>
                    {selectedRecData.priority === 'hoog' ? 'Hoog' : 
                     selectedRecData.priority === 'medium' ? 'Medium' : 
                     'Laag'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Type actie</span>
                  <span className="info-value">{selectedRecData.type}</span>
                </div>
              </div>

              <div className="rec-description">
                <h4>📝 Reden voor aanbeveling</h4>
                <p>{selectedRecData.reason}</p>
              </div>

              <div className="rec-steps">
                <h4>📋 Uitvoeringsstappen</h4>
                <ol className="steps-list">
                  <li>Voorbereiding materiaal en gereedschap</li>
                  <li>Controleer weersvoorspelling</li>
                  <li>Voer actie uit op aanbevolen datum</li>
                  <li>Documenteer resultaten</li>
                </ol>
              </div>

              <div className="rec-actions-large">
                <button 
                  className="action-btn-large primary"
                  onClick={() => applyRecommendation(selectedRecData.id)}
                >
                  ✅ Direct Toepassen
                </button>
                <button 
                  className="action-btn-large secondary"
                  onClick={() => scheduleRecommendation(selectedRecData.id)}
                >
                  📅 Inplannen
                </button>
                <button className="action-btn-large tertiary">
                  📊 Meer Details
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Selecteer een aanbeveling om details te zien</p>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="ai-insights-card">
          <h3>🤖 AI Inzichten</h3>
          <div className="insights-list">
            {aiInsights.map(insight => (
              <div key={insight.id} className="insight-item">
                <div className="insight-icon">{insight.icon}</div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                  <div className="insight-confidence">
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${insight.confidence}%` }}
                      ></div>
                    </div>
                    <span className="confidence-value">{insight.confidence}% zeker</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="ai-info">
            <p>💡 Deze inzichten zijn gegenereerd door ons AI-model op basis van historische data en huidige omstandigheden.</p>
          </div>
        </div>

        {/* Planning Calendar */}
        <div className="planning-calendar-card">
          <h3>📅 Planning Kalender</h3>
          <div className="calendar-view">
            <div className="calendar-header">
              <button className="nav-btn">←</button>
              <h4>Maart 2024</h4>
              <button className="nav-btn">→</button>
            </div>
            <div className="calendar-grid">
              {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <div key={day} className="calendar-day">
                  <span className="day-number">{day}</span>
                  {day === 15 && <span className="event-dot planten">🌱</span>}
                  {day === 20 && <span className="event-dot bemesten">🧪</span>}
                  {day === 25 && <span className="event-dot oogsten">🌾</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot planten">🌱</span>
              <span>Planten</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot bemesten">🧪</span>
              <span>Bemesten</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot oogsten">🌾</span>
              <span>Oogsten</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartPlanner;