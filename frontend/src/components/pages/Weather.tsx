import React, { useState } from 'react';
import './Weather.css';

const Weather: React.FC = () => {
  const [weather, setWeather] = useState({
    current: {
      temp: 14,
      condition: 'Zonnig',
      humidity: 65,
      wind: 12,
      pressure: 1013,
      feelsLike: 13,
      icon: '☀️'
    },
    forecast: [
      { day: 'Vandaag', high: 16, low: 8, condition: 'Zonnig', icon: '☀️', rain: 0 },
      { day: 'Morgen', high: 18, low: 10, condition: 'Licht bewolkt', icon: '⛅', rain: 10 },
      { day: 'Overmorgen', high: 15, low: 9, condition: 'Regen', icon: '🌧️', rain: 80 },
      { day: 'Woensdag', high: 17, low: 11, condition: 'Bewolkt', icon: '☁️', rain: 30 },
      { day: 'Donderdag', high: 19, low: 12, condition: 'Zonnig', icon: '☀️', rain: 5 },
    ],
    alerts: [
      { type: 'vorst', message: 'Nachtvorst verwacht (-2°C)', severity: 'medium' },
      { type: 'wind', message: 'Hardnekkige wind (25 km/h)', severity: 'low' },
    ]
  });

  const locations = [
    { name: 'Noord Akker', temp: 13, condition: 'Zonnig', humidity: 62 },
    { name: 'Zuid Weide', temp: 15, condition: 'Licht bewolkt', humidity: 68 },
    { name: 'Oost Veld', temp: 12, condition: 'Bewolkt', humidity: 75 },
    { name: 'West Perceel', temp: 14, condition: 'Zonnig', humidity: 60 },
  ];

  return (
    <div className="weather-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🌤️ Weer & Klimaat</h1>
          <p>Live weersinformatie en voorspellingen voor uw velden</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn">
            🔄 Vernieuwen
          </button>
          <button className="location-btn">
            📍 Locaties
          </button>
        </div>
      </div>

      <div className="weather-grid">
        {/* Current Weather */}
        <div className="current-weather-card">
          <div className="current-weather-header">
            <h2>Huidig Weer</h2>
            <span className="location">📍 Boerderij De Groene Akker</span>
          </div>
          <div className="current-weather-content">
            <div className="temp-display">
              <span className="temp-icon">{weather.current.icon}</span>
              <div className="temp-values">
                <span className="temp-main">{weather.current.temp}°C</span>
                <span className="temp-feels">Voelt als {weather.current.feelsLike}°C</span>
              </div>
            </div>
            <div className="weather-condition">
              <h3>{weather.current.condition}</h3>
              <p>Perfect weer voor veldwerk</p>
            </div>
            <div className="weather-details-grid">
              <div className="weather-detail">
                <span className="detail-icon">💧</span>
                <div className="detail-info">
                  <span className="detail-label">Vochtigheid</span>
                  <span className="detail-value">{weather.current.humidity}%</span>
                </div>
              </div>
              <div className="weather-detail">
                <span className="detail-icon">💨</span>
                <div className="detail-info">
                  <span className="detail-label">Wind</span>
                  <span className="detail-value">{weather.current.wind} km/h</span>
                </div>
              </div>
              <div className="weather-detail">
                <span className="detail-icon">📊</span>
                <div className="detail-info">
                  <span className="detail-label">Luchtdruk</span>
                  <span className="detail-value">{weather.current.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="forecast-card">
          <h2>5-Daagse Voorspelling</h2>
          <div className="forecast-list">
            {weather.forecast.map((day, idx) => (
              <div key={idx} className="forecast-item">
                <span className="forecast-day">{day.day}</span>
                <span className="forecast-icon">{day.icon}</span>
                <div className="forecast-temps">
                  <span className="temp-high">{day.high}°</span>
                  <span className="temp-low">{day.low}°</span>
                </div>
                <span className="forecast-condition">{day.condition}</span>
                <div className="rain-chance">
                  <span className="rain-icon">💧</span>
                  <span className="rain-value">{day.rain}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Alerts */}
        <div className="alerts-card">
          <h2>⚠️ Weerswaarschuwingen</h2>
          <div className="alerts-list">
            {weather.alerts.map((alert, idx) => (
              <div key={idx} className={`alert-item ${alert.severity}`}>
                <div className="alert-icon">
                  {alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🔵'}
                </div>
                <div className="alert-content">
                  <h4>{alert.type.toUpperCase()}</h4>
                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="alert-info">
            <p>Controleer uw gewassen bij vorstwaarschuwingen</p>
          </div>
        </div>

        {/* Field Locations */}
        <div className="locations-card">
          <h2>🌾 Weer per Veld</h2>
          <div className="locations-list">
            {locations.map((location, idx) => (
              <div key={idx} className="location-item">
                <div className="location-info">
                  <h4>{location.name}</h4>
                  <span className="location-condition">{location.condition}</span>
                </div>
                <div className="location-weather">
                  <span className="location-temp">{location.temp}°C</span>
                  <span className="location-humidity">💧 {location.humidity}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Tips */}
        <div className="tips-card">
          <h2>💡 Weer Tips</h2>
          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-icon">🌱</div>
              <div className="tip-content">
                <h4>Ideaal voor zaaien</h4>
                <p>Vandaag is perfect voor het zaaien van aardappelen en uien</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">💧</div>
              <div className="tip-content">
                <h4>Beregening niet nodig</h4>
                <p>Genoeg vocht in de lucht, bespaar water vandaag</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">🌾</div>
              <div className="tip-content">
                <h4>Oogst voorbereiden</h4>
                <p>Overmorgen regen, plan oogstwerk voor morgen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Data */}
        <div className="history-card">
          <h2>📈 Historische Data</h2>
          <div className="history-stats">
            <div className="history-stat">
              <span className="stat-label">Gem. Temperatuur</span>
              <span className="stat-value">12.5°C</span>
            </div>
            <div className="history-stat">
              <span className="stat-label">Neerslag deze maand</span>
              <span className="stat-value">45 mm</span>
            </div>
            <div className="history-stat">
              <span className="stat-label">Zonuren</span>
              <span className="stat-value">125 uur</span>
            </div>
          </div>
          <div className="history-chart">
            <div className="chart-placeholder">
              📊 Temperatuur trend afgelopen 30 dagen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;