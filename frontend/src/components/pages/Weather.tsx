import React, { useEffect, useState, useRef } from "react";
import "./Weather.css";
import * as fieldsApi from "../../api/fields";

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
  const rawApiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
  const apiBaseUrl = rawApiUrl.replace(/\/+$/, "");
  const [city, setCity] = useState("Antwerpen");
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const latestRequestId = useRef(0);

  // OSM search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const buildForecast = (data: any) => {
    const list = data?.list || [];
    const daily: Record<string, any> = {};

    list.forEach((item: any) => {
      const [dateStr, timeStr] = item.dt_txt.split(" ");
      if (!daily[dateStr]) {
        daily[dateStr] = { temps: [], pops: [], noon: null };
      }
      daily[dateStr].temps.push(item.main.temp);
      daily[dateStr].pops.push(item.pop ?? 0);
      if (timeStr === "12:00:00") {
        daily[dateStr].noon = item;
      }
    });

    const dates = Object.keys(daily).sort();
    const fiveDays = dates.slice(0, 5).map((dateStr) => {
      const entry = daily[dateStr];
      const temps = entry.temps;
      const min = Math.round(Math.min(...temps));
      const max = Math.round(Math.max(...temps));
      const rep = entry.noon || list.find((item: any) => item.dt_txt.startsWith(dateStr));
      const main = rep?.weather?.[0]?.main || "Clouds";
      const desc = rep?.weather?.[0]?.description || "Onbekend";
  const maxPop = entry.pops.length ? Math.max(...entry.pops) : 0;
  const rain = Math.round((maxPop as number) * 100);
      const dayLabel = new Date(dateStr).toLocaleDateString("nl-BE", { weekday: "short" });
      return {
        date: dateStr,
        dayLabel,
        min,
        max,
        icon: mapIcon(main),
        condition: desc,
        rain,
      };
    });

    setForecast(fiveDays);
  };

  async function fetchWeather(selectedCity: string) {
    const normalizedCity = selectedCity.trim();
    if (!normalizedCity) return;
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${apiBaseUrl}/weather?city=${normalizedCity}`),
        fetch(`${apiBaseUrl}/weather/forecast?city=${normalizedCity}`),
      ]);

      const data = await currentRes.json();
      const forecastData = await forecastRes.json();

      if (requestId !== latestRequestId.current) return;

      setWeather({
        current: {
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind: Math.round(data.wind.speed * 3.6),
          condition: data.weather[0].description,
          icon: mapIcon(data.weather[0].main),
          clouds: data.clouds?.all ?? 0,
          visibility: data.visibility ?? 0,
          sunrise: data.sys?.sunrise ?? 0,
          sunset: data.sys?.sunset ?? 0,
        },
      });

      buildForecast(forecastData);

      setCity(normalizedCity);
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      console.error("Weather fetch failed", err);
    }
    if (requestId === latestRequestId.current) {
      setLoading(false);
    }
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
    const init = async () => {
      await fetchWeather(city);
      try {
        const data = await fieldsApi.getFields();
        setFields(data);
        if (data.length > 0) {
          setSelectedFieldId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load fields", err);
      }
    };

    init();
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

  const selectedField = fields.find((field) => field.id === selectedFieldId);
  const fieldLocationLabel = selectedField?.address || selectedField?.name || "";
  const fieldCity = selectedField?.address?.split(",")[0] || selectedField?.name || "";

  const handleFieldChange = (value: string) => {
    const id = Number.parseInt(value, 10);
    if (Number.isNaN(id)) return;
    setSelectedFieldId(id);
    setShowSuggestions(false);
    const field = fields.find((f) => f.id === id);
    const nextCity = field?.address?.split(",")[0] || field?.name || "";
    if (nextCity) {
      fetchWeather(nextCity);
    }
  };

  if (loading || !weather) {
    return <div className="weather-page">🌤️ Weer laden...</div>;
  }

  const visibilityKm = weather.current.visibility
    ? Math.round(weather.current.visibility / 1000)
    : null;
  const sunriseTime = weather.current.sunrise
    ? new Date(weather.current.sunrise * 1000).toLocaleTimeString("nl-BE", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  const sunsetTime = weather.current.sunset
    ? new Date(weather.current.sunset * 1000).toLocaleTimeString("nl-BE", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const alerts = [
    weather.current.wind > 35
      ? {
          level: "high",
          title: "Harde wind",
          message: "Sterke windstoten verwacht. Beveilig losse materialen.",
        }
      : null,
    weather.current.humidity < 40
      ? {
          level: "medium",
          title: "Droge lucht",
          message: "Overweeg extra irrigatie voor gevoelige gewassen.",
        }
      : null,
    weather.current.temp > 30
      ? {
          level: "low",
          title: "Hoge temperatuur",
          message: "Plan werk vroeg in de ochtend om hitte te vermijden.",
        }
      : null,
  ].filter(Boolean) as Array<{ level: string; title: string; message: string }>;

  return (
    <div className="weather-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🌤️ Weer & Klimaat</h1>
          <p>Live weersinformatie voor uw velden</p>
        </div>

        <div className="header-actions">
          <button className="refresh-btn" onClick={() => fetchWeather(city)}>
            🔄 Vernieuwen
          </button>
        </div>
      </div>

      {/* Permanent search bar */}
      <div className="permanent-search-bar">
        <div className="search-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="🔍 Zoek een andere locatie..."
            className="search-input"
          />
          <button className="search-btn" onClick={() => fetchWeather(query)}>
            Zoek
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
      </div>

      <div className="weather-grid">
        <div className="current-weather-card">
          <div className="current-weather-header">
            <div className="header-left">
              <h2>Huidig Weer</h2>
              <span className="location">📍 {selectedField?.name || city}</span>
            </div>
            <div className="field-selector-inline">
              <label>Veld:</label>
              <select
                value={selectedFieldId ?? ""}
                onChange={(e) => handleFieldChange(e.target.value)}
              >
                {fields.length === 0 && <option value="">Geen velden</option>}
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
            </div>
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

        <div className="forecast-card">
          <h2>🌦️ Komende 5 dagen</h2>
          <div className="forecast-list">
            {forecast.map((day) => (
              <div key={day.date} className="forecast-item">
                <div className="forecast-day">{day.dayLabel}</div>
                <div className="forecast-icon">{day.icon}</div>
                <div className="forecast-temps">
                  <span className="temp-high">{day.max}°</span>
                  <span className="temp-low">{day.min}°</span>
                </div>
                <div className="forecast-condition">{day.condition}</div>
                <div className="rain-chance">
                  <span className="rain-icon">💧</span>
                  <span className="rain-value">{day.rain}%</span>
                </div>
              </div>
            ))}
            {forecast.length === 0 && (
              <div className="forecast-empty">Geen voorspelling beschikbaar.</div>
            )}
          </div>
        </div>

        <div className="insights-card">
          <h2>📈 Dagoverzicht</h2>
          <div className="insights-grid">
            <div className="insight-item">
              <span className="insight-icon">👁️</span>
              <div>
                <p className="insight-label">Zichtbaarheid</p>
                <p className="insight-value">{visibilityKm !== null ? `${visibilityKm} km` : "—"}</p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">☁️</span>
              <div>
                <p className="insight-label">Bewolking</p>
                <p className="insight-value">{weather.current.clouds ?? "—"}%</p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">🌅</span>
              <div>
                <p className="insight-label">Zonsopgang</p>
                <p className="insight-value">{sunriseTime}</p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">🌇</span>
              <div>
                <p className="insight-label">Zonsondergang</p>
                <p className="insight-value">{sunsetTime}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="alerts-card">
          <h2>⚠️ Weerwaarschuwingen</h2>
          <div className="alerts-list">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`alert-item ${alert.level}`}>
                <span className="alert-icon">🚨</span>
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
          {alerts.length === 0 && (
            <div className="alert-info">
              <p>Geen waarschuwingen voor vandaag.</p>
            </div>
          )}
        </div>

        <div className="tips-card">
          <h2>💡 Weertips</h2>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">🪴</span>
              <div className="tip-content">
                <h4>Waterbeheer</h4>
                <p>Plan irrigatie in de ochtend om verdamping te beperken.</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🌬️</span>
              <div className="tip-content">
                <h4>Wind</h4>
                <p>Controleer netten en tunnels bij wind boven 30 km/h.</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">☀️</span>
              <div className="tip-content">
                <h4>Zon & warmte</h4>
                <p>Werk vroeg en houd het veld vochtig bij warm weer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
