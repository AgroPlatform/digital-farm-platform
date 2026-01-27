import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Fields.css';
import L from 'leaflet';

interface Field {
  id: number;
  name: string;
  size: string;
  soilType: string;
  crops: string[];
  status: 'actief' | 'inactief';
  lastCrop: string;
  nextAction: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface AddressSuggestion {
  display_name: string;
  lat: number;
  lon: number;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Fields: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);

  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [editingField, setEditingField] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState<{
    name: string;
    size: string;
    soilType: string;
    crops: string[];
    status: 'actief' | 'inactief';
    lastCrop: string;
    nextAction: string;
    address: string;
    lat?: number;
    lng?: number;
  }>({
    name: '',
    size: '',
    soilType: 'Klei',
    crops: [],
    status: 'actief',
    lastCrop: '',
    nextAction: '',
    address: '',
  });

  const soilTypes = [
    { type: 'Klei', color: '#8B4513', description: 'Zware grond, goed water vasthoudend' },
    { type: 'Zand', color: '#F4A460', description: 'Lichte grond, snel drainerend' },
    { type: 'Leem', color: '#D2691E', description: 'Ideale grond, goede balans' },
    { type: 'Zandleem', color: '#CD853F', description: 'Gemengde grond, veelzijdig' },
  ];

  const selectedFieldData = fields.find(field => field.id === selectedField);

  const toggleFieldStatus = (id: number) => {
    setFields(fields.map(field => 
      field.id === id 
        ? { ...field, status: field.status === 'actief' ? 'inactief' : 'actief' }
        : field
    ));
  };

  const totalArea = fields.reduce((sum, field) => {
    const area = parseFloat(field.size.split(' ')[0]);
    return sum + (isNaN(area) ? 0 : area);
  }, 0);

  const activeFields = fields.filter(f => f.status === 'actief').length;

  // Edit field function
  const editField = (id: number) => {
    const fieldToEdit = fields.find(f => f.id === id);
    if (fieldToEdit) {
      setEditingField(id);
      setNewField({
        name: fieldToEdit.name,
        size: fieldToEdit.size.split(' ')[0], // Remove 'ha' for editing
        soilType: fieldToEdit.soilType,
        crops: [...fieldToEdit.crops],
        status: fieldToEdit.status as 'actief' | 'inactief',
        lastCrop: fieldToEdit.lastCrop,
        nextAction: fieldToEdit.nextAction,
        address: fieldToEdit.address || ''
      });
    }
  };

  // Save edited field
  const saveEditedField = () => {
    if (editingField) {
      setFields(fields.map(field => 
        field.id === editingField 
          ? { 
              ...field, 
              name: newField.name,
              size: `${newField.size} ha`,
              soilType: newField.soilType,
              crops: newField.crops,
              status: newField.status,
              lastCrop: newField.lastCrop,
              nextAction: newField.nextAction,
              address: newField.address || field.address
            }
          : field
      ));
      setEditingField(null);
      setNewField({
        name: '',
        size: '',
        soilType: 'Klei',
        crops: [],
        status: 'actief',
        lastCrop: '',
        nextAction: '',
        address: ''
      });
    }
  };

  // Delete field function
  const deleteField = (id: number) => {
    if (window.confirm('Weet u zeker dat u dit veld wilt verwijderen?')) {
      const updatedFields = fields.filter(field => field.id !== id);
      setFields(updatedFields);
      
      // If the deleted field was selected, select the first field or null
      if (selectedField === id) {
        setSelectedField(updatedFields.length > 0 ? updatedFields[0].id : null);
      }
    }
  };

  // Add new field with form
  const addFieldWithForm = () => {
    if (!newField.name.trim() || !newField.size.trim()) {
      alert('Vul alstublieft de naam en grootte van het veld in');
      return;
    }

    const newId = fields.length > 0 ? Math.max(...fields.map(f => f.id)) + 1 : 1;
    const fieldToAdd = {
      id: newId,
      name: newField.name,
      size: `${newField.size} ha`,
      soilType: newField.soilType,
      crops: newField.crops,
      status: newField.status,
      lastCrop: newField.lastCrop || '-',
      nextAction: newField.nextAction || 'Plannen',
      address: newField.address || 'Limburg, België'
    };

    setFields([...fields, fieldToAdd]);
    setSelectedField(newId);
    setShowAddForm(false);
    setNewField({
      name: '',
      size: '',
      soilType: 'Klei',
      crops: [],
      status: 'actief',
      lastCrop: '',
      nextAction: '',
      address: ''
    });
  };

  // Cancel editing or adding
  const cancelForm = () => {
    setEditingField(null);
    setShowAddForm(false);
    setNewField({
      name: '',
      size: '',
      soilType: 'Klei',
      crops: [],
      status: 'actief',
      lastCrop: '',
      nextAction: '',
      address: ''
    });
  };

  // State for address autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Function to search for address suggestions
  const searchAddress = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=be&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Function to handle address selection
  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setNewField({
      ...newField,
      address: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lon
    });
    setAddressSuggestions([]);
  };

  // Function to get coordinates for a field
  const getFieldCoordinates = (fieldId: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.lat !== undefined && field.lng !== undefined) {
      return { lat: field.lat, lng: field.lng };
    }
    // Default to Hasselt center if no coordinates
    return { lat: 50.9301, lng: 5.3378 };
  };

  // Function to get color based on field status
  const getFieldColor = (status: string) => {
    return status === 'actief' ? '#4CAF50' : '#636e72';
  };

  return (
    <div className="fields-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🌾 Velden Beheer</h1>
          <p>Beheer uw landbouwvelden en perceelsinformatie</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Lijst
            </button>
            <button 
              className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              🗺️ Kaart
            </button>
          </div>
          <button className="primary-button" onClick={() => setShowAddForm(true)}>
            <span className="button-icon">➕</span>
            Nieuw Veld
          </button>
        </div>
      </div>

      <div className="fields-stats">
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-content">
            <h3>{fields.length}</h3>
            <p>Totaal Velden</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📏</div>
          <div className="stat-content">
            <h3>{totalArea} ha</h3>
            <p>Totaal Oppervlakte</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{activeFields}</h3>
            <p>Actieve Velden</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <h3>{fields.reduce((sum, f) => sum + f.crops.length, 0)}</h3>
            <p>Actieve Gewassen</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingField) && (
        <div className="field-form-overlay">
          <div className="field-form-card">
            <h3>{editingField ? '📝 Veld Bewerken' : '➕ Nieuw Veld Toevoegen'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Veld Naam *</label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                  placeholder="Bijv. Noord Akker"
                />
              </div>
              <div className="form-group">
                <label>Grootte (ha) *</label>
                <input
                  type="number"
                  value={newField.size}
                  onChange={(e) => setNewField({...newField, size: e.target.value})}
                  placeholder="Bijv. 5"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Adres *</label>
                <div className="address-autocomplete">
                  <input
                    type="text"
                    value={newField.address}
                    onChange={(e) => {
                      setNewField({...newField, address: e.target.value});
                      searchAddress(e.target.value);
                    }}
                    onFocus={() => {
                      if (newField.address.length >= 3) {
                        searchAddress(newField.address);
                      }
                    }}
                    placeholder="Bijv. Koning Albertlaan 50, 3500 Hasselt, België"
                  />
                  {isSearchingAddress && (
                    <div className="address-loading">Zoeken...</div>
                  )}
                  {addressSuggestions.length > 0 && (
                    <div className="address-suggestions">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="address-suggestion-item"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          {suggestion.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <small className="form-hint">Begin te typen om adressuggesties te zien</small>
              </div>
              <div className="form-group">
                <label>Bodemtype</label>
                <select
                  value={newField.soilType}
                  onChange={(e) => setNewField({...newField, soilType: e.target.value})}
                >
                  <option value="Klei">Klei</option>
                  <option value="Zand">Zand</option>
                  <option value="Leem">Leem</option>
                  <option value="Zandleem">Zandleem</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newField.status}
                  onChange={(e) => setNewField({...newField, status: e.target.value as 'actief' | 'inactief'})}
                >
                  <option value="actief">Actief</option>
                  <option value="inactief">Inactief</option>
                </select>
              </div>
              <div className="form-group">
                <label>Laatste Gewas</label>
                <input
                  type="text"
                  value={newField.lastCrop}
                  onChange={(e) => setNewField({...newField, lastCrop: e.target.value})}
                  placeholder="Bijv. Tarwe"
                />
              </div>
              <div className="form-group">
                <label>Volgende Actie</label>
                <input
                  type="text"
                  value={newField.nextAction}
                  onChange={(e) => setNewField({...newField, nextAction: e.target.value})}
                  placeholder="Bijv. Bemesten"
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="secondary-button" onClick={cancelForm}>
                Annuleren
              </button>
              <button 
                className="primary-button" 
                onClick={editingField ? saveEditedField : addFieldWithForm}
              >
                {editingField ? 'Opslaan' : 'Toevoegen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="fields-grid">
        {/* Fields List */}
        <div className="fields-list-card">
          <div className="card-header">
            <h3>📋 Velden Overzicht</h3>
            <span className="card-subtitle">{fields.length} velden totaal</span>
          </div>
          <div className="fields-list">
            {fields.map(field => (
              <div 
                key={field.id} 
                className={`field-item ${selectedField === field.id ? 'selected' : ''}`}
                onClick={() => setSelectedField(field.id)}
              >
                <div className="field-header">
                  <div className="field-icon">
                    {field.soilType === 'Klei' ? '🟤' : 
                     field.soilType === 'Zand' ? '🟡' : 
                     field.soilType === 'Leem' ? '🟠' : '🟢'}
                  </div>
                  <div className="field-info">
                    <h4>{field.name}</h4>
                    <div className="field-meta">
                      <span className="field-size">📏 {field.size}</span>
                      <span className="field-soil">🌱 {field.soilType}</span>
                    </div>
                  </div>
                  <button 
                    className={`status-badge ${field.status}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFieldStatus(field.id);
                    }}
                  >
                    {field.status === 'actief' ? 'Actief' : 'Inactief'}
                  </button>
                </div>
                <div className="field-crops">
                  {field.crops.length > 0 ? (
                    <div className="crops-tags">
                      {field.crops.map((crop, idx) => (
                        <span key={idx} className="crop-tag">
                          {crop}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="no-crops">Geen gewassen</span>
                  )}
                </div>
                <div className="field-actions">
                  <div className="action-info">
                    <span className="last-crop">Laatst: {field.lastCrop}</span>
                    <span className="next-action">Volgende: {field.nextAction}</span>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        editField(field.id);
                      }}
                      title="Veld bewerken"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteField(field.id);
                      }}
                      title="Veld verwijderen"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Field Details */}
        <div className="field-details-card">
          <h3>📋 Veld Details</h3>
          {selectedFieldData ? (
            <div className="field-detail-content">
              <div className="field-header-large">
                <div className="field-icon-large">
                  {selectedFieldData.soilType === 'Klei' ? '🟤' : 
                   selectedFieldData.soilType === 'Zand' ? '🟡' : 
                   selectedFieldData.soilType === 'Leem' ? '🟠' : '🟢'}
                </div>
                <div className="field-title">
                  <h2>{selectedFieldData.name}</h2>
                  <div className="field-status-large">
                    <span className={`status ${selectedFieldData.status}`}>
                      {selectedFieldData.status === 'actief' ? 'Actief' : 'Inactief'}
                    </span>
                    <span className="field-size-large">{selectedFieldData.size}</span>
                  </div>
                </div>
                <div className="field-detail-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => editField(selectedFieldData.id)}
                    title="Veld bewerken"
                  >
                    ✏️ Bewerken
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteField(selectedFieldData.id)}
                    title="Veld verwijderen"
                  >
                    🗑️ Verwijderen
                  </button>
                </div>
              </div>

              <div className="field-info-grid">
                <div className="info-item">
                  <span className="info-label">Bodemtype</span>
                  <span className="info-value">{selectedFieldData.soilType}</span>
                  <span className="info-desc">
                    {soilTypes.find(s => s.type === selectedFieldData.soilType)?.description || 'Onbekend bodemtype'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Laatste Gewas</span>
                  <span className="info-value">{selectedFieldData.lastCrop}</span>
                  <span className="info-desc">Vorige teelt cyclus</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Volgende Actie</span>
                  <span className="info-value highlight">{selectedFieldData.nextAction}</span>
                  <span className="info-desc">Aanbevolen volgende stap</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={`info-value ${selectedFieldData.status}`}>
                    {selectedFieldData.status === 'actief' ? 'In productie' : 'Rustperiode'}
                  </span>
                  <span className="info-desc">Huidige veldstatus</span>
                </div>
              </div>

              <div className="field-crops-section">
                <h4>🌱 Huidige Gewassen</h4>
                {selectedFieldData.crops.length > 0 ? (
                  <div className="current-crops">
                    {selectedFieldData.crops.map((crop, idx) => (
                      <div key={idx} className="crop-item">
                        <span className="crop-icon">🌽</span>
                        <div className="crop-details">
                          <strong>{crop}</strong>
                          <span>Groeiende op dit veld</span>
                        </div>
                        <button className="crop-action">📊</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-crops-message">
                    <p>Geen gewassen op dit veld</p>
                    <button className="add-crop-btn">➕ Gewas toevoegen</button>
                  </div>
                )}
              </div>

              <div className="field-history">
                <h4>📈 Veld Geschiedenis</h4>
                <div className="history-timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">Maart 2024</div>
                    <div className="timeline-content">
                      <strong>Aardappelen geplant</strong>
                      <p>5 ha geplant, verwachte oogst: 200 ton</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">December 2023</div>
                    <div className="timeline-content">
                      <strong>Tarwe geoogst</strong>
                      <p>40 ton geoogst, goede kwaliteit</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">September 2023</div>
                    <div className="timeline-content">
                      <strong>Bodemanalyse</strong>
                      <p>Stikstofgehalte: medium, pH: 6.5</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Selecteer een veld om details te zien</p>
            </div>
          )}
        </div>

        {/* Soil Types */}
        <div className="soil-types-card">
          <h3>🟤 Bodemtypes</h3>
          <div className="soil-types-list">
            {soilTypes.map(soil => (
              <div key={soil.type} className="soil-type-item">
                <div className="soil-color" style={{ backgroundColor: soil.color }}></div>
                <div className="soil-info">
                  <h4>{soil.type}</h4>
                  <p>{soil.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="soil-tips">
            <h4>💡 Bodem Tips</h4>
            <ul>
              <li>Klei: Regelmatig beluchten voor betere drainage</li>
              <li>Zand: Vaker bewateren, organisch materiaal toevoegen</li>
              <li>Leem: Ideaal voor meeste gewassen</li>
            </ul>
          </div>
        </div>

        {/* Field Map Preview */}
        <div className="field-map-card">
          <h3>🗺️ Veld Kaart</h3>
          <div className="map-preview">
            <div className="map-grid">
              {fields.slice(0, 6).map(field => (
                <div 
                  key={field.id}
                  className={`map-field ${selectedField === field.id ? 'selected' : ''} ${field.status}`}
                  style={{
                    gridColumn: `span ${parseInt(field.size.split(' ')[0]) > 5 ? 2 : 1}`,
                    gridRow: `span ${parseInt(field.size.split(' ')[0]) > 5 ? 2 : 1}`
                  }}
                  onClick={() => setSelectedField(field.id)}
                >
                  <span className="map-field-name">{field.name}</span>
                  <span className="map-field-size">{field.size}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-color actief"></span>
              <span>Actief veld</span>
            </div>
            <div className="legend-item">
              <span className="legend-color inactief"></span>
              <span>Inactief veld</span>
            </div>
            <div className="legend-item">
              <span className="legend-color selected"></span>
              <span>Geselecteerd</span>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="map-view-container">
          <div className="map-view-header">
            <h3>🗺️ Veld Kaart Overzicht</h3>
            <p>Klik op een veld op de kaart om details te zien</p>
          </div>
          <div className="map-layout">
            <div className="map-section">
              <div className="map-container">
                {/* @ts-ignore */}
                <MapContainer 
                  center={[50.9650, 5.5000]} 
                  zoom={11} 
                  style={{ height: '600px', width: '100%', borderRadius: '16px' }}
                >
                  {/* @ts-ignore */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {fields.map(field => {
                    const coords = getFieldCoordinates(field.id);
                    return (
                      <Marker
                        key={field.id}
                        position={[coords.lat, coords.lng]}
                        eventHandlers={{
                          click: () => setSelectedField(field.id),
                        }}
                      >
                        <Popup>
                          <div className="map-popup">
                            <h4>{field.name}</h4>
                            <p><strong>Grootte:</strong> {field.size}</p>
                            <p><strong>Bodemtype:</strong> {field.soilType}</p>
                            <p><strong>Status:</strong> {field.status === 'actief' ? 'Actief' : 'Inactief'}</p>
                            <p><strong>Laatste gewas:</strong> {field.lastCrop}</p>
                            <div className="popup-actions">
                              <button 
                                className="edit-btn"
                                onClick={() => editField(field.id)}
                              >
                                ✏️ Bewerken
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => deleteField(field.id)}
                              >
                                🗑️ Verwijderen
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
            <div className="details-section">
              <div className="field-details-card">
                <h3>📋 Veld Details</h3>
                {selectedFieldData ? (
                  <div className="field-detail-content">
                    <div className="field-header-large">
                      <div className="field-icon-large">
                        {selectedFieldData.soilType === 'Klei' ? '🟤' : 
                         selectedFieldData.soilType === 'Zand' ? '🟡' : 
                         selectedFieldData.soilType === 'Leem' ? '🟠' : '🟢'}
                      </div>
                      <div className="field-title">
                        <h2>{selectedFieldData.name}</h2>
                        <div className="field-status-large">
                          <span className={`status ${selectedFieldData.status}`}>
                            {selectedFieldData.status === 'actief' ? 'Actief' : 'Inactief'}
                          </span>
                          <span className="field-size-large">{selectedFieldData.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="field-info-grid">
                      <div className="info-item">
                        <span className="info-label">Bodemtype</span>
                        <span className="info-value">{selectedFieldData.soilType}</span>
                        <span className="info-desc">
                          {soilTypes.find(s => s.type === selectedFieldData.soilType)?.description || 'Onbekend bodemtype'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Laatste Gewas</span>
                        <span className="info-value">{selectedFieldData.lastCrop}</span>
                        <span className="info-desc">Vorige teelt cyclus</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Volgende Actie</span>
                        <span className="info-value highlight">{selectedFieldData.nextAction}</span>
                        <span className="info-desc">Aanbevolen volgende stap</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Status</span>
                        <span className={`info-value ${selectedFieldData.status}`}>
                          {selectedFieldData.status === 'actief' ? 'In productie' : 'Rustperiode'}
                        </span>
                        <span className="info-desc">Huidige veldstatus</span>
                      </div>
                    </div>

                    <div className="field-detail-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => editField(selectedFieldData.id)}
                        title="Veld bewerken"
                      >
                        ✏️ Bewerken
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteField(selectedFieldData.id)}
                        title="Veld verwijderen"
                      >
                        🗑️ Verwijderen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-selection">
                    <p>Selecteer een veld op de kaart om details te zien</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fields;