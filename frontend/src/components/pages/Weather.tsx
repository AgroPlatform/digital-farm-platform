import React, { useEffect, useState } from "react";
import "./Weather.css";

function mapIcon(main: string) {
  if (main === "Clear") return "☀️";
  if (main === "Clouds") return "☁️";
  if (main === "Rain") return "🌧️";
  if (main === "Drizzle") return "🌦️";
  if (main === "Thunderstorm") return "⛈️";
  if (main === "Snow") return "❄️";
  return "🌤️";
}

const Weather: React.FC = () => {
  const [city, setCity] = useState("Antwerpen");
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);

  // OSM search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  async function fetchWeather(selectedCity: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/weather?city=${selectedCity}`
      );
      const data = await res.json();

      setWeather({
        current: {
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind: Math.round(data.wind.speed * 3.6),
          condition: data.weather[0].description,
          icon: mapIcon(data.weather[0].main),
        },
      });

      setCity(selectedCity);
    } catch (err) {
      console.error("Weather fetch failed", err);
    }
    setLoading(false);
  }

  // OSM search function
  async function fetchSuggestions(search: string) {
    if (!search) {
      setSuggestions([]);
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      search
    )}&addressdetails=1&limit=5`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "DigitalFarmPlatform/1.0",
      },
    });

    const data = await res.json();
    setSuggestions(data);
  }

  useEffect(() => {
    fetchWeather(city);
  }, []);

  // Search query watcher
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelectSuggestion = (item: any) => {
    const selectedCity = item.display_name.split(",")[0];
    setQuery(item.display_name);
    setShowSuggestions(false);
    fetchWeather(selectedCity);
  };

  if (loading || !weather) {
    return <div className="weather-page">🌤️ Weer laden...</div>;
  }

  return (
    <div className="weather-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🌤️ Weer & Klimaat</h1>
          <p>Live weersinformatie voor uw velden</p>
        </div>

        {/* Search bar */}
        <div className="search-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Zoek locatie "
            className="search-input"
          />
          <button className="search-btn" onClick={() => fetchWeather(query)}>
            🔍 Zoek
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-box">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  {item.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header-actions">
          <button className="refresh-btn" onClick={() => fetchWeather(city)}>
            🔄 Vernieuwen
          </button>
        </div>
      </div>

      <div className="weather-grid">
        <div className="current-weather-card">
          <div className="current-weather-header">
            <h2>Huidig Weer</h2>
            <span className="location">📍 {city}</span>
          </div>

          <div className="current-weather-content">
            <div className="temp-display">
              <span className="temp-icon">{weather.current.icon}</span>
              <div className="temp-values">
                <span className="temp-main">{weather.current.temp}°C</span>
                <span className="temp-feels">
                  Voelt als {weather.current.feelsLike}°C
                </span>
              </div>
            </div>

            <div className="weather-condition">
              <h3>{weather.current.condition}</h3>
            </div>

            <div className="weather-details-grid">
              <div className="weather-detail">💧 {weather.current.humidity}%</div>
              <div className="weather-detail">
                💨 {weather.current.wind} km/h
              </div>
              <div className="weather-detail">
                📊 {weather.current.pressure} hPa
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
