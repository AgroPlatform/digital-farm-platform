import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Crops.css';
import { getCrops, updateCrop, createCrop } from '../../api/crops';
import type { Crop } from '../../types/crop';

const Crops: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeason, setFilterSeason] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const cropTypes = ['all', 'Knolgewas', 'Graan', 'Bolgewas', 'Bladgroente'];
  const seasons = ['all', 'Lente', 'Zomer', 'Herfst', 'Voorjaar'];
  const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
  const seasonMonths: Record<string, number[]> = {
    Lente: [2, 3, 4],
    Zomer: [5, 6, 7],
    Herfst: [8, 9, 10],
    Winter: [11, 0, 1],
    Voorjaar: [1, 2, 3],
  };

  const parseDurationDays = (duration?: string) => {
    const match = duration?.match(/(\d+)/);
    return match ? Number.parseInt(match[1], 10) : 0;
  };

  const getMonthSequence = (startMonth: number, count: number) => {
    const months: number[] = [];
    for (let i = 0; i < count; i += 1) {
      months.push((startMonth + i) % 12);
    }
    return months;
  };

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const data = await getCrops();
        setCrops(data);
        if (data.length > 0) {
          setSelectedCrop(data[0].id);
        }
        setError(null);
      } catch (error) {
        console.error("Failed to fetch crops:", error);
        const message = error instanceof Error ? error.message : 'Gewassen konden niet worden geladen';
        setError(message);
        toast.error(message);
      }
    };

    fetchCrops();
  }, []);

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || crop.type === filterType;
    const matchesSeason = filterSeason === 'all' || crop.season === filterSeason;
    return matchesSearch && matchesType && matchesSeason;
  });

  const selectedCropData = crops.find(crop => crop.id === selectedCrop);
  const selectedSeasonMonths = selectedCropData ? (seasonMonths[selectedCropData.season] || []) : [];
  const growthDays = selectedCropData ? parseDurationDays(selectedCropData.duration) : 0;
  const growthMonthsCount = Math.max(1, Math.ceil(growthDays / 30));
  const growthMonths = selectedSeasonMonths.length > 0
    ? getMonthSequence(selectedSeasonMonths[0], growthMonthsCount)
    : [];
  const harvestMonths = growthMonths.length > 0 ? [growthMonths[growthMonths.length - 1]] : [];

  const toggleCropStatus = async (id: number) => {
    const crop = crops.find(c => c.id === id);
    if (!crop) return;

    const newStatus = crop.status === 'actief' ? 'inactief' : 'actief';
    
    try {
      const updatedCrop = await updateCrop(id, { status: newStatus });
      setCrops(crops.map(c => c.id === id ? updatedCrop : c));
    } catch (error) {
      console.error("Failed to update crop status:", error);
      const message = error instanceof Error ? error.message : 'Status kon niet worden bijgewerkt';
      toast.error(message);
    }
  };

  return (
    <div className="crops-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🌽 <span className="header-title-text">Gewassen Database</span></h1>
          <p>Beheer en bekijk informatie over alle gewassen</p>
        </div>
      </div>
      {error && (
        <div className="crops-error-banner">
          <strong>Gewassen konden niet worden geladen.</strong>
          <span>{error}</span>
        </div>
      )}

      {/* Filters Section - Full Width */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Zoek in gewassen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filters-row">
            <div className="filter-dropdown">
              <span className="filter-label">Type:</span>
              <div className="filter-options">
                {cropTypes.map(type => (
                  <button
                    key={type}
                    className={`filter-chip ${filterType === type ? 'active' : ''}`}
                    onClick={() => setFilterType(type)}
                  >
                    {type === 'all' ? 'Alles' : type}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-divider"></div>

            <div className="filter-dropdown">
              <span className="filter-label">Seizoen:</span>
              <div className="filter-options">
                {seasons.map(season => (
                  <button
                    key={season}
                    className={`filter-chip ${filterSeason === season ? 'active' : ''}`}
                    onClick={() => setFilterSeason(season)}
                  >
                    {season === 'all' ? 'Alles' : season}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-badge">
            <span className="stat-dot total"></span>
            Totaal: <strong>{crops.length}</strong>
          </div>
          <div className="stat-badge">
            <span className="stat-dot active"></span>
            Actief: <strong>{crops.filter(c => c.status === 'actief').length}</strong>
          </div>
          <div className="stat-badge">
            <span className="stat-dot inactive"></span>
            Inactief: <strong>{crops.filter(c => c.status === 'inactief').length}</strong>
          </div>
        </div>
      </div>

      <div className="crops-grid">
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
                    {crop.icon}
                  </div>
                  <div className="crop-info">
                    <h4>{crop.name}</h4>
                    <span className="crop-type">{crop.type}</span>
                  </div>
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
                  {selectedCropData.icon}
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
                    <span className="stat-value">{selectedCropData.water_needs}</span>
                  </div>
                </div>
                <div className="crop-stat">
                  <span className="stat-icon">📊</span>
                  <div className="stat-info">
                    <span className="stat-label">Opbrengst</span>
                    <span className="stat-value">{selectedCropData.expected_yield}</span>
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
            {monthNames.map((month, index) => {
              const isPlant = selectedSeasonMonths.includes(index);
              const isGrow = growthMonths.includes(index);
              const isHarvest = harvestMonths.includes(index);
              return (
                <div key={month} className={`calendar-month ${isPlant || isGrow || isHarvest ? 'active' : ''}`}>
                  <span className="month-name">{month}</span>
                  <div className="month-crops">
                    {selectedCropData && isPlant && (
                      <span className="crop-indicator plant" title={`Plant: ${selectedCropData.name}`}>{selectedCropData.icon}</span>
                    )}
                    {selectedCropData && isGrow && (
                      <span className="crop-indicator grow" title={`Groei: ${selectedCropData.name}`}></span>
                    )}
                    {selectedCropData && isHarvest && (
                      <span className="crop-indicator harvest" title={`Oogst: ${selectedCropData.name}`}></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {!selectedCropData && (
            <p className="calendar-hint">Selecteer een gewas om de kalender te zien.</p>
          )}
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-color plant"></span>
              <span>Plant seizoen</span>
            </div>
            <div className="legend-item">
              <span className="legend-color grow"></span>
              <span>Groei periode</span>
            </div>
            <div className="legend-item">
              <span className="legend-color harvest"></span>
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
