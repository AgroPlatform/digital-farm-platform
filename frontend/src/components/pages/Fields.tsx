import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Fields.css';
import * as fieldsApi from '../../api/fields';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix voor Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamische import voor react-leaflet om TypeScript errors te vermijden
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;

const loadLeafletComponents = async () => {
  if (typeof window !== 'undefined') {
    const leaflet = await import('react-leaflet');
    MapContainer = leaflet.MapContainer;
    TileLayer = leaflet.TileLayer;
    Marker = leaflet.Marker;
    Popup = leaflet.Popup;
    return true;
  }
  return false;
};

// Preload de componenten
let leafletLoaded = false;
if (typeof window !== 'undefined') {
  loadLeafletComponents().then(loaded => {
    leafletLoaded = loaded;
  });
}

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

const Fields: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [editingField, setEditingField] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
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
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const soilTypes = [
    { type: 'Klei', color: '#8B4513', description: 'Zware grond, goed water vasthoudend' },
    { type: 'Zand', color: '#F4A460', description: 'Lichte grond, snel drainerend' },
    { type: 'Leem', color: '#D2691E', description: 'Ideale grond, goede balans' },
    { type: 'Zandleem', color: '#CD853F', description: 'Gemengde grond, veelzijdig' },
  ];

  const selectedFieldData = fields.find(field => field.id === selectedField);

  useEffect(() => {
    loadFields();
    // Load leaflet components on mount
    if (typeof window !== 'undefined' && !leafletLoaded) {
      loadLeafletComponents().then(loaded => {
        setLeafletLoaded(loaded);
      });
    }
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      const apiFields = await fieldsApi.getFields();
      const convertedFields: Field[] = apiFields.map(f => ({
        id: f.id,
        name: f.name,
        size: `${f.size} ha`,
        soilType: f.soil_type,
        crops: f.crops || [],
        status: f.status as 'actief' | 'inactief',
        lastCrop: f.last_crop || '-',
        nextAction: f.next_action || 'Plannen',
        address: f.address || 'Limburg, België',
        lat: f.lat,
        lng: f.lng,
      }));
      setFields(convertedFields);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load fields');
      console.error('Error loading fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldStatus = async (id: number) => {
    const field = fields.find(f => f.id === id);
    if (!field) return;
    const newStatus = field.status === 'actief' ? 'inactief' : 'actief';
    try {
      await fieldsApi.updateField(id, {
        name: field.name,
        size: parseFloat(field.size.split(' ')[0]),
        soil_type: field.soilType,
        crops: field.crops,
        status: newStatus,
        last_crop: field.lastCrop,
        next_action: field.nextAction,
        address: field.address,
        lat: field.lat,
        lng: field.lng,
      });
      await loadFields();
    } catch (err: any) {
      toast.error(`Failed to update field status: ${err.message}`);
    }
  };

  const totalArea = fields.reduce((sum, field) => {
    const area = parseFloat(field.size.split(' ')[0]);
    return sum + (isNaN(area) ? 0 : area);
  }, 0);

  const activeFields = fields.filter(f => f.status === 'actief').length;

  const editField = (id: number) => {
    const fieldToEdit = fields.find(f => f.id === id);
    if (fieldToEdit) {
      setEditingField(id);
      setNewField({
        name: fieldToEdit.name,
        size: fieldToEdit.size.split(' ')[0],
        soilType: fieldToEdit.soilType,
        crops: [...fieldToEdit.crops],
        status: fieldToEdit.status as 'actief' | 'inactief',
        lastCrop: fieldToEdit.lastCrop,
        nextAction: fieldToEdit.nextAction,
        address: fieldToEdit.address || '',
        lat: fieldToEdit.lat,
        lng: fieldToEdit.lng,
      });
      setShowAddForm(true);
    }
  };

  const saveEditedField = async () => {
    if (!editingField) return;
    if (!newField.name.trim() || !newField.size.trim()) {
      toast.warning('Vul alstublieft de naam en grootte van het veld in');
      return;
    }
    try {
      await fieldsApi.updateField(editingField, {
        name: newField.name,
        size: parseFloat(newField.size),
        soil_type: newField.soilType,
        crops: newField.crops,
        status: newField.status,
        last_crop: newField.lastCrop,
        next_action: newField.nextAction,
        address: newField.address,
        lat: newField.lat,
        lng: newField.lng,
      });
      await loadFields();
      setEditingField(null);
      setNewField({
        name: '',
        size: '',
        soilType: 'Klei',
        crops: [],
        status: 'actief',
        lastCrop: '',
        nextAction: '',
        address: '',
      });
      setShowAddForm(false);
      toast.success('Veld bijgewerkt.');
    } catch (err: any) {
      toast.error(`Failed to update field: ${err.message}`);
    }
  };

  const deleteField = async (id: number) => {
    if (!window.confirm('Weet u zeker dat u dit veld wilt verwijderen?')) return;
    try {
      await fieldsApi.deleteField(id);
      await loadFields();
      if (selectedField === id) {
        setSelectedField(null);
      }
    } catch (err: any) {
      toast.error(`Failed to delete field: ${err.message}`);
    }
  };

  const addFieldWithForm = async () => {
    if (!newField.name.trim() || !newField.size.trim()) {
      toast.warning('Vul alstublieft de naam en grootte van het veld in');
      return;
    }
    try {
      await fieldsApi.createField({
        name: newField.name,
        size: parseFloat(newField.size),
        soil_type: newField.soilType,
        crops: newField.crops,
        status: newField.status,
        last_crop: newField.lastCrop,
        next_action: newField.nextAction,
        address: newField.address,
        lat: newField.lat,
        lng: newField.lng,
      });
      await loadFields();
      setShowAddForm(false);
      setNewField({
        name: '',
        size: '',
        soilType: 'Klei',
        crops: [],
        status: 'actief',
        lastCrop: '',
        nextAction: '',
        address: '',
      });
      toast.success('Veld toegevoegd.');
    } catch (err: any) {
      toast.error(`Failed to create field: ${err.message}`);
    }
  };

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
      address: '',
    });
    setAddressSuggestions([]);
  };

  const searchAddress = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsSearchingAddress(true);
    try {
      // Voeg een kleine delay toe om te voorkomen dat we te snel achter elkaar API calls doen
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=be&limit=5&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Address suggestions received:', data);
      setAddressSuggestions(data);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
      // Fallback: toon een paar voorbeeld suggesties als de API niet werkt
      if (query.toLowerCase().includes('hasselt')) {
        setAddressSuggestions([
          { display_name: 'Hasselt, Limburg, België', lat: 50.9301, lon: 5.3378 },
          { display_name: 'Hasselt Station, Hasselt, Limburg, België', lat: 50.9310, lon: 5.3380 },
          { display_name: 'Hasselt Centrum, Hasselt, Limburg, België', lat: 50.9290, lon: 5.3360 }
        ]);
      }
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setNewField({
      ...newField,
      address: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lon
    });
    setAddressSuggestions([]);
  };

  if (loading) return <div className="fields-page">Loading fields...</div>;
  if (error) return <div className="fields-page">Error: {error}</div>;

  const renderMapView = () => {
    // Bepaal centrum van de kaart
    const defaultCenter: [number, number] = [50.9301, 5.3378]; // Hasselt
    const defaultZoom = 12;
    
    // Als er velden zijn met coördinaten, bereken het centrum
    const fieldsWithCoords = fields.filter(f => f.lat && f.lng);
    let center: [number, number] = defaultCenter;
    let zoom = defaultZoom;
    
    if (fieldsWithCoords.length > 0) {
      const avgLat = fieldsWithCoords.reduce((sum, f) => sum + (f.lat || 0), 0) / fieldsWithCoords.length;
      const avgLng = fieldsWithCoords.reduce((sum, f) => sum + (f.lng || 0), 0) / fieldsWithCoords.length;
      center = [avgLat, avgLng];
      zoom = fieldsWithCoords.length === 1 ? 14 : 12;
    }

    // Check if leaflet components are loaded
    if (!MapContainer || !TileLayer || !Marker || !Popup) {
      return (
        <div className="map-view-container">
          <div className="map-view-header">
            <h3>🗺️ Velden op Kaart</h3>
            <p>Kaart wordt geladen...</p>
          </div>
          <div className="map-layout">
            <div className="map-section">
              <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '600px' }}>
                <div className="loading-map">
                  <p>Kaartcomponenten laden...</p>
                  <button className="primary-button" onClick={() => window.location.reload()}>
                    🔄 Herlaad pagina
                  </button>
                </div>
              </div>
            </div>
            <div className="details-section">
              <div className="field-details-card">
                <div className="no-selection">
                  <p>Kaart wordt geladen</p>
                  <p className="hint">Probeer de lijstweergave als de kaart niet laadt</p>
                  <button 
                    className="primary-button"
                    onClick={() => setViewMode('list')}
                  >
                    📋 Naar lijstweergave
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="map-view-container">
        <div className="map-view-header">
          <h3>🗺️ Velden op Kaart</h3>
          <p>Klik op een marker om veldinformatie te zien</p>
        </div>
        <div className="map-layout">
          <div className="map-section">
            <div className="map-container">
              {/* @ts-ignore - react-leaflet v5 type mismatches */}
              <MapContainer 
                center={center} 
                zoom={zoom} 
                style={{ height: '600px', width: '100%', borderRadius: '12px' }}
                scrollWheelZoom={true}
              >
                {/* @ts-ignore - react-leaflet v5 type mismatches */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {fields.map((field) => {
                  if (!field.lat || !field.lng) return null;
                  
                  const icon = L.divIcon({
                    html: `<div style="background: ${field.status === 'actief' ? '#4CAF50' : '#636e72'}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🌾</div>`,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  });

                  return (
                    // @ts-ignore - react-leaflet v5 type mismatches
                    <Marker
                      key={field.id}
                      position={[field.lat, field.lng]}
                      icon={icon}
                      eventHandlers={{
                        click: () => setSelectedField(field.id),
                      }}
                    >
                      <Popup>
                        <div className="map-popup">
                          <h4>{field.name}</h4>
                          <p><strong>Grootte:</strong> {field.size}</p>
                          <p><strong>Bodemtype:</strong> {field.soilType}</p>
                          <p><strong>Status:</strong> {field.status === 'actief' ? '✅ Actief' : '⏸️ Inactief'}</p>
                          <p><strong>Adres:</strong> {field.address}</p>
                          <div className="popup-actions">
                            <button className="edit-btn" onClick={() => editField(field.id)}>
                              ✏️
                            </button>
                            <button className="delete-btn" onClick={() => deleteField(field.id)}>
                              🗑️
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
              {selectedFieldData ? (
                <div className="field-detail-content">
                  <div className="field-header-large">
                    <div className="field-icon-large">🌾</div>
                    <div className="field-title">
                      <h2>{selectedFieldData.name}</h2>
                      <div className="field-status-large">
                        <span className={`status ${selectedFieldData.status}`}>
                          {selectedFieldData.status === 'actief' ? '✅ Actief' : '⏸️ Inactief'}
                        </span>
                        <span className="field-size-large">{selectedFieldData.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="field-info-grid">
                    <div className="info-item">
                      <span className="info-label">Bodemtype</span>
                      <span className="info-value">{selectedFieldData.soilType}</span>
                      <span className="info-desc">{soilTypes.find(s => s.type === selectedFieldData.soilType)?.description}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Adres</span>
                      <span className="info-value">{selectedFieldData.address}</span>
                      <span className="info-desc">📍 Locatie</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Laatste Gewas</span>
                      <span className="info-value">{selectedFieldData.lastCrop}</span>
                      <span className="info-desc">🌾 Vorige teelt</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Volgende Actie</span>
                      <span className="info-value highlight">{selectedFieldData.nextAction}</span>
                      <span className="info-desc">📅 Planning</span>
                    </div>
                  </div>
                  <div className="field-detail-actions">
                    <button className="edit-btn" onClick={() => editField(selectedFieldData.id)}>
                      ✏️ Bewerken
                    </button>
                    <button className="delete-btn" onClick={() => deleteField(selectedFieldData.id)}>
                      🗑️ Verwijderen
                    </button>
                    <button 
                      className={`status-badge ${selectedFieldData.status}`}
                      onClick={() => toggleFieldStatus(selectedFieldData.id)}
                    >
                      {selectedFieldData.status === 'actief' ? '⏸️ Deactiveren' : '✅ Activeren'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <p>Klik op een marker om veldinformatie te zien</p>
                  <p className="hint">Of ga terug naar de lijstweergave</p>
                  <button 
                    className="primary-button"
                    onClick={() => setViewMode('list')}
                  >
                    📋 Naar lijstweergave
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="fields-grid">
      {/* Fields List Card */}
      <div className="fields-list-card">
        <div className="card-header">
          <div>
            <h3>🌾 Velden Lijst</h3>
            <p className="card-subtitle">Selecteer een veld voor details</p>
          </div>
          <div className="action-buttons">
            <button className="edit-btn" onClick={() => setShowAddForm(true)} title="Nieuw veld">
              ➕
            </button>
          </div>
        </div>
        <div className="fields-list">
          {fields.length === 0 ? (
            <div className="no-selection">
              <p>Geen velden gevonden</p>
              <button className="primary-button" onClick={() => setShowAddForm(true)}>
                ➕ Voeg eerste veld toe
              </button>
            </div>
          ) : (
            fields.map((field) => (
              <div 
                key={field.id} 
                className={`field-item ${selectedField === field.id ? 'selected' : ''}`}
                onClick={() => setSelectedField(field.id)}
              >
                <div className="field-header">
                  <div className="field-icon">🌾</div>
                  <div className="field-info">
                    <h4>{field.name}</h4>
                    <div className="field-meta">
                      <span>{field.size}</span>
                      <span>•</span>
                      <span>{field.soilType}</span>
                    </div>
                  </div>
                  <button 
                    className={`status-badge ${field.status}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFieldStatus(field.id);
                    }}
                  >
                    {field.status === 'actief' ? '✅ Actief' : '⏸️ Inactief'}
                  </button>
                </div>
                <div className="field-crops">
                  <div className="crops-tags">
                    {field.crops.length > 0 ? (
                      field.crops.map((crop, index) => (
                        <span key={index} className="crop-tag">
                          {crop}
                        </span>
                      ))
                    ) : (
                      <span className="no-crops">Geen gewassen</span>
                    )}
                  </div>
                </div>
                <div className="field-actions">
                  <div className="action-info">
                    <span className="last-crop">📅 {field.lastCrop}</span>
                    <span className="next-action">⚡ {field.nextAction}</span>
                  </div>
                  <div className="action-buttons">
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); editField(field.id); }} title="Bewerken">
                      ✏️
                    </button>
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); deleteField(field.id); }} title="Verwijderen">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Field Details Card */}
      <div className="field-details-card">
        {selectedFieldData ? (
          <div className="field-detail-content">
            <div className="field-header-large">
              <div className="field-icon-large">🌾</div>
              <div className="field-title">
                <h2>{selectedFieldData.name}</h2>
                <div className="field-status-large">
                  <span className={`status ${selectedFieldData.status}`}>
                    {selectedFieldData.status === 'actief' ? '✅ Actief' : '⏸️ Inactief'}
                  </span>
                  <span className="field-size-large">{selectedFieldData.size}</span>
                </div>
              </div>
            </div>
            <div className="field-info-grid">
              <div className="info-item">
                <span className="info-label">Bodemtype</span>
                <span className="info-value">{selectedFieldData.soilType}</span>
                <span className="info-desc">{soilTypes.find(s => s.type === selectedFieldData.soilType)?.description}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Adres</span>
                <span className="info-value">{selectedFieldData.address}</span>
                <span className="info-desc">📍 Locatie</span>
              </div>
              <div className="info-item">
                <span className="info-label">Laatste Gewas</span>
                <span className="info-value">{selectedFieldData.lastCrop}</span>
                <span className="info-desc">🌾 Vorige teelt</span>
              </div>
              <div className="info-item">
                <span className="info-label">Volgende Actie</span>
                <span className="info-value highlight">{selectedFieldData.nextAction}</span>
                <span className="info-desc">📅 Planning</span>
              </div>
            </div>
            <div className="field-crops-section">
              <h4>🌱 Gewassen</h4>
              {selectedFieldData.crops.length > 0 ? (
                <div className="current-crops">
                  {selectedFieldData.crops.map((crop, index) => (
                    <div key={index} className="crop-item">
                      <div className="crop-icon">🌱</div>
                      <div className="crop-details">
                        <strong>{crop}</strong>
                        <span>Actief gewas</span>
                      </div>
                      <button className="crop-action" title="Verwijder gewas">
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-crops-message">
                  <p>Geen gewassen toegevoegd aan dit veld</p>
                  <button className="add-crop-btn">➕ Gewas toevoegen</button>
                </div>
              )}
            </div>
            <div className="field-detail-actions">
              <button className="edit-btn" onClick={() => editField(selectedFieldData.id)}>
                ✏️ Bewerken
              </button>
              <button className="delete-btn" onClick={() => deleteField(selectedFieldData.id)}>
                🗑️ Verwijderen
              </button>
              <button 
                className={`status-badge ${selectedFieldData.status}`}
                onClick={() => toggleFieldStatus(selectedFieldData.id)}
              >
                {selectedFieldData.status === 'actief' ? '⏸️ Deactiveren' : '✅ Activeren'}
              </button>
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <p>Selecteer een veld om details te zien</p>
            <p className="hint">Klik op een veld in de lijst</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fields-page">
      {/* Header */}
      <div className="fields-header">
        <div>
          <h1>🌾 Velden Beheer</h1>
          <p>Beheer uw landbouwgronden en veldgegevens</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              📋 Lijst
            </button>
            <button
              className={viewMode === 'map' ? 'active' : ''}
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

      {/* Statistics */}
      <div className="fields-stats">
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-content">
            <h3>{fields.length}</h3>
            <p>Totaal Velden</p>
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
          <div className="stat-icon">📏</div>
          <div className="stat-content">
            <h3>{totalArea.toFixed(1)} ha</h3>
            <p>Totale Oppervlakte</p>
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

      {/* Main Content - Map or List View */}
      <div className="fields-main-content">
        {viewMode === 'map' ? renderMapView() : renderListView()}
      </div>

      {/* Soil Types Card */}
      <div className="soil-types-card">
        <h3>🏞️ Bodemtypes</h3>
        <div className="soil-types-list">
          {soilTypes.map((soil) => (
            <div key={soil.type} className="soil-type-item">
              <div className="soil-color" style={{ background: soil.color }}></div>
              <div className="soil-info">
                <h4>{soil.type}</h4>
                <p>{soil.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="soil-tips">
          <h4>💡 Tips</h4>
          <ul>
            <li>Zware kleigrond heeft goede drainage nodig</li>
            <li>Zandgrond vraagt meer bemesting</li>
            <li>Leemgrond is ideaal voor de meeste gewassen</li>
            <li>Test regelmatig de pH-waarde van uw grond</li>
          </ul>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={cancelForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingField ? '✏️ Veld Bewerken' : '➕ Nieuw Veld Toevoegen'}</h3>
              <button onClick={cancelForm} className="close-btn">✖️</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Veldnaam *</label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                  placeholder="Bijv. Noord Veld"
                />
              </div>
              <div className="form-group">
                <label>Grootte (ha) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={newField.size}
                  onChange={(e) => setNewField({...newField, size: e.target.value})}
                  placeholder="Bijv. 5.5"
                />
              </div>
              <div className="form-group">
                <label>Bodemtype</label>
                <select
                  value={newField.soilType}
                  onChange={(e) => setNewField({...newField, soilType: e.target.value})}
                >
                  {soilTypes.map(soil => (
                    <option key={soil.type} value={soil.type}>{soil.type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Adres</label>
                <div className="address-autocomplete">
                  <input
                    type="text"
                    value={newField.address}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewField({...newField, address: value});
                      searchAddress(value);
                    }}
                    placeholder="Begin met typen voor suggesties (bijv. Hasselt)..."
                    onFocus={() => {
                      if (newField.address.length >= 3) {
                        searchAddress(newField.address);
                      }
                    }}
                  />
                  {isSearchingAddress && <p className="searching">Zoeken naar adressen...</p>}
                  {addressSuggestions.length > 0 && (
                    <div className="address-suggestions">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="address-suggestion-item"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          <div className="suggestion-icon">📍</div>
                          <div className="suggestion-text">
                            <div className="suggestion-main">{suggestion.display_name.split(',')[0]}</div>
                            <div className="suggestion-details">
                              {suggestion.display_name.split(',').slice(1).join(',').trim()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="form-hint">Typ minimaal 3 karakters voor suggesties</p>
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
                  placeholder="Bijv. Ploegen"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={cancelForm} className="cancel-btn">Annuleren</button>
              <button
                onClick={editingField ? saveEditedField : addFieldWithForm}
                className="save-btn"
              >
                {editingField ? 'Opslaan' : 'Toevoegen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fields;
