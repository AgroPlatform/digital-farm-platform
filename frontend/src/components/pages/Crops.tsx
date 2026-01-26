import React, { useState } from 'react';
import './Crops.css';

const Crops: React.FC = () => {
  const [crops, setCrops] = useState([
    { id: 1, name: 'Aardappelen', type: 'Knolgewas', season: 'Lente', duration: '120 dagen', water: 'Medium', yield: '40 ton/ha', status: 'actief' },
    { id: 2, name: 'Tarwe', type: 'Graan', season: 'Herfst', duration: '240 dagen', water: 'Laag', yield: '8 ton/ha', status: 'actief' },
    { id: 3, name: 'Maïs', type: 'Graan', season: 'Zomer', duration: '90 dagen', water: 'Hoog', yield: '12 ton/ha', status: 'actief' },
    { id: 4, name: 'Suikerbieten', type: 'Knolgewas', season: 'Lente', duration: '180 dagen', water: 'Medium', yield: '60 ton/ha', status: 'inactief' },
    { id: 5, name: 'Gerst', type: 'Graan', season: 'Herfst', duration: '210 dagen', water: 'Laag', yield: '7 ton/ha', status: 'actief' },
    { id: 6, name: 'Uien', type: 'Bolgewas', season: 'Lente', duration: '150 dagen', water: 'Medium', yield: '50 ton/ha', status: 'actief' },
    { id: 7, name: 'Wortelen', type: 'Knolgewas', season: 'Lente', duration: '100 dagen', water: 'Medium', yield: '45 ton/ha', status: 'inactief' },
    { id: 8, name: 'Spinazie', type: 'Bladgroente', season: 'Voorjaar', duration: '45 dagen', water: 'Hoog', yield: '20 ton/ha', status: 'actief' },
  ]);

  const [selectedCrop, setSelectedCrop] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeason, setFilterSeason] = useState('all');

  const cropTypes = ['all', 'Knolgewas', 'Graan', 'Bolgewas', 'Bladgroente'];
  const seasons = ['all', 'Lente', 'Zomer', 'Herfst', 'Voorjaar'];

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || crop.type === filterType;
    const matchesSeason = filterSeason === 'all' || crop.season === filterSeason;
    return matchesSearch && matchesType && matchesSeason;
  });

  const selectedCropData = crops.find(crop => crop.id === selectedCrop);

  const addNewCrop = () => {
    const newId = crops.length + 1;
    const newCrop = {
      id: newId,
      name: `Nieuw Gewas ${newId}`,
      type: 'Knolgewas',
      season: 'Lente',
      duration: '100 dagen',
      water: 'Medium',
      yield: '0 ton/ha',
      status: 'actief'
    };
    setCrops([...crops, newCrop]);
    setSelectedCrop(newId);
  };

  const toggleCropStatus = (id: number) => {
    setCrops(crops.map(crop => 
      crop.id === id 
        ? { ...crop, status: crop.status === 'actief' ? 'inactief' : 'actief' }
        : crop
    ));
  };

  return (
    <div className="crops-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🌽 Gewassen Database</h1>
          <p>Beheer en bekijk informatie over alle gewassen</p>
        </div>
        <button className="primary-button" onClick={addNewCrop}>
          <span className="button-icon">➕</span>
          Nieuw Gewas
        </button>
      </div>

      <div className="crops-grid">
        {/* Filters */}
        <div className="filters-card">
          <h3>🔍 Filters</h3>
          <div className="search-box">
            <input
              type="text"
              placeholder="Zoek gewas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>
          <div className="filter-group">
            <label>Type Gewas</label>
            <div className="filter-buttons">
              {cropTypes.map(type => (
                <button
                  key={type}
                  className={`filter-btn ${filterType === type ? 'active' : ''}`}
                  onClick={() => setFilterType(type)}
                >
                  {type === 'all' ? 'Alle' : type}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Seizoen</label>
            <div className="filter-buttons">
              {seasons.map(season => (
                <button
                  key={season}
                  className={`filter-btn ${filterSeason === season ? 'active' : ''}`}
                  onClick={() => setFilterSeason(season)}
                >
                  {season === 'all' ? 'Alle' : season}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-stats">
            <div className="stat">
              <span className="stat-label">Totaal</span>
              <span className="stat-value">{crops.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Actief</span>
              <span className="stat-value">{crops.filter(c => c.status === 'actief').length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Inactief</span>
              <span className="stat-value">{crops.filter(c => c.status === 'inactief').length}</span>
            </div>
          </div>
        </div>

        {/* Crops List */}
        <div className="crops-list-card">
          <h3>🌾 Gewassen Lijst</h3>
          <div className="crops-list">
            {filteredCrops.map(crop => (
              <div 
                key={crop.id} 
                className={`crop-item ${selectedCrop === crop.id ? 'selected' : ''}`}
                onClick={() => setSelectedCrop(crop.id)}
              >
                <div className="crop-header">
                  <div className="crop-icon">
                    {crop.type === 'Knolgewas' ? '🥔' : 
                     crop.type === 'Graan' ? '🌾' : 
                     crop.type === 'Bolgewas' ? '🧅' : '🥬'}
                  </div>
                  <div className="crop-info">
                    <h4>{crop.name}</h4>
                    <span className="crop-type">{crop.type}</span>
                  </div>
                  <button 
                    className={`status-toggle ${crop.status}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCropStatus(crop.id);
                    }}
                  >
                    {crop.status === 'actief' ? '✅' : '⏸️'}
                  </button>
                </div>
                <div className="crop-details">
                  <span className="crop-detail">📅 {crop.season}</span>
                  <span className="crop-detail">⏱️ {crop.duration}</span>
                  <span className="crop-detail">💧 {crop.water}</span>
                </div>
                <div className="crop-yield">
                  <span className="yield-label">Opbrengst:</span>
                  <span className="yield-value">{crop.yield}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Crop Details */}
        <div className="crop-details-card">
          <h3>📋 Gewas Details</h3>
          {selectedCropData ? (
            <div className="crop-detail-content">
              <div className="crop-header-large">
                <div className="crop-icon-large">
                  {selectedCropData.type === 'Knolgewas' ? '🥔' : 
                   selectedCropData.type === 'Graan' ? '🌾' : 
                   selectedCropData.type === 'Bolgewas' ? '🧅' : '🥬'}
                </div>
                <div className="crop-title">
                  <h2>{selectedCropData.name}</h2>
                  <span className={`crop-status ${selectedCropData.status}`}>
                    {selectedCropData.status === 'actief' ? 'Actief' : 'Inactief'}
                  </span>
                </div>
              </div>

              <div className="crop-stats-grid">
                <div className="crop-stat">
                  <span className="stat-icon">📅</span>
                  <div className="stat-info">
                    <span className="stat-label">Seizoen</span>
                    <span className="stat-value">{selectedCropData.season}</span>
                  </div>
                </div>
                <div className="crop-stat">
                  <span className="stat-icon">⏱️</span>
                  <div className="stat-info">
                    <span className="stat-label">Groeiperiode</span>
                    <span className="stat-value">{selectedCropData.duration}</span>
                  </div>
                </div>
                <div className="crop-stat">
                  <span className="stat-icon">💧</span>
                  <div className="stat-info">
                    <span className="stat-label">Waterbehoefte</span>
                    <span className="stat-value">{selectedCropData.water}</span>
                  </div>
                </div>
                <div className="crop-stat">
                  <span className="stat-icon">📊</span>
                  <div className="stat-info">
                    <span className="stat-label">Opbrengst</span>
                    <span className="stat-value">{selectedCropData.yield}</span>
                  </div>
                </div>
              </div>

              <div className="crop-requirements">
                <h4>🌱 Groei Vereisten</h4>
                <div className="requirements-list">
                  <div className="requirement">
                    <span className="req-icon">🌡️</span>
                    <div className="req-content">
                      <strong>Bodemtemperatuur</strong>
                      <p>8-10°C voor optimale groei</p>
                    </div>
                  </div>
                  <div className="requirement">
                    <span className="req-icon">🌱</span>
                    <div className="req-content">
                      <strong>Bodemtype</strong>
                      <p>Losse, goed gedraineerde grond</p>
                    </div>
                  </div>
                  <div className="requirement">
                    <span className="req-icon">☀️</span>
                    <div className="req-content">
                      <strong>Zonlicht</strong>
                      <p>Minimaal 6 uur per dag</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="crop-tips">
                <h4>💡 Tips voor {selectedCropData.name}</h4>
                <ul className="tips-list">
                  <li>Plant in rijen met 30cm tussenruimte</li>
                  <li>Bemest met stikstofrijke meststof</li>
                  <li>Controleer regelmatig op ongedierte</li>
                  <li>Oogst bij droog weer voor beste kwaliteit</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Selecteer een gewas om details te zien</p>
            </div>
          )}
        </div>

        {/* Crop Calendar */}
        <div className="calendar-card">
          <h3>📅 Gewassen Kalender</h3>
          <div className="calendar-months">
            {['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'].map(month => (
              <div key={month} className="calendar-month">
                <span className="month-name">{month}</span>
                <div className="month-crops">
                  {crops.slice(0, 3).map(crop => (
                    <span key={crop.id} className="crop-indicator" style={{ backgroundColor: '#4CAF50' }}></span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
              <span>Plant seizoen</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
              <span>Groei periode</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
              <span>Oogst periode</span>
            </div>
          </div>
        </div>

        {/* Crop Recommendations */}
        <div className="recommendations-card">
          <h3>✨ Aanbevolen Gewassen</h3>
          <div className="recommendations-list">
            <div className="recommendation">
              <div className="rec-icon">🌱</div>
              <div className="rec-content">
                <h4>Spinazie voor Noord Akker</h4>
                <p>Perfect voor korte teelt tussen gewassen</p>
                <span className="rec-reason">Bodem geschikt voor bladgroenten</span>
              </div>
            </div>
            <div className="recommendation">
              <div className="rec-icon">💧</div>
              <div className="rec-content">
                <h4>Maïs voor Zuid Weide</h4>
                <p>Hoge waterbehoefte, goede drainage</p>
                <span className="rec-reason">Zandgrond houdt water vast</span>
              </div>
            </div>
            <div className="recommendation">
              <div className="rec-icon">📈</div>
              <div className="rec-content">
                <h4>Tarwe rotatie</h4>
                <p>Wissel met aardappelen voor bodemgezondheid</p>
                <span className="rec-reason">Voorkomt bodemuitputting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crops;