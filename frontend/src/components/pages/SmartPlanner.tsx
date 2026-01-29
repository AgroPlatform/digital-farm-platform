import React, { useEffect, useState } from "react";
import "./SmartPlanner.css";
import * as fieldsApi from "../../api/fields";
import type { Field } from "../../api/fields";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

interface Advice {
  field: string;
  advice: string;
  weather: WeatherData;
  fieldInfo: Field;
}

const SmartPlanner: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [adviceList, setAdviceList] = useState<Advice[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const fieldsData: Field[] = await fieldsApi.getFields();
        setFields(fieldsData);

        const adviceArr: Advice[] = [];

        for (let field of fieldsData) {
          // Default weather object
          let weather: WeatherData = {
            temp: 20,
            condition: "onbekend",
            humidity: 78,
            wind: 0,
          };

          try {
            // 1️⃣ Haal eerst de stad van het veld via jouw endpoint
            const cityRes = await fetch(
              `http://localhost:8000/fields/${field.id}/city`,
              { credentials: "include" } // nodig als backend auth vereist
            );

            let city = "Antwerpen"; // fallback
            if (cityRes.ok) {
              const cityJson = await cityRes.json();
              if (cityJson.city) city = cityJson.city;
            } else {
              console.warn(`City API returned ${cityRes.status} for field ${field.id}`);
            }

            // 2️⃣ Gebruik de city om weer op te halen
            const weatherRes = await fetch(
              `http://localhost:8000/weather?city=${encodeURIComponent(city)}`,
              { credentials: "include" }
            );

            if (weatherRes.ok) {
              const weatherJson = await weatherRes.json();
              weather = {
                temp: Math.round(weatherJson.main?.temp || 20),
                condition: weatherJson.weather?.[0]?.description || "onbekend",
                humidity: weatherJson.main?.humidity || 78,
                wind: Math.round((weatherJson.wind?.speed || 0) * 3.6),
              };
            } else {
              console.warn(`Weather API returned ${weatherRes.status} for city ${city}`);
            }
          } catch (err) {
            console.warn(`Weather fetch failed for ${field.name}`, err);
          }

          adviceArr.push({
            ...generateAdvice(field, weather),
            weather,
            fieldInfo: field,
          });
        }

        setAdviceList(adviceArr);
      } catch (err) {
        console.error("SmartPlanner load error", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const generateAdvice = (field: Field, weather: WeatherData) => {
  let advice = "Geen directe actie nodig";

  // ❄️ Vorst / zeer koud
  if (weather.temp <= 3) {
    advice = "Risico op vorst – vermijd werkzaamheden op het veld";
  }

  // 🌫️ Hoge luchtvochtigheid / mist
  else if (weather.humidity >= 85) {
    advice = "Hoge luchtvochtigheid – verhoogd risico op schimmels";
  }

  // 🌬️ Veel wind
  else if (weather.wind >= 30) {
    advice = "Sterke wind – stel sproeien of bemesten uit";
  }

  // 🌧️ Regen
  else if (
    weather.condition.toLowerCase().includes("regen") ||
    weather.condition.toLowerCase().includes("rain")
  ) {
    advice = "Regen verwacht – irrigatie is niet nodig";
  }

  // ☀️ Warm & droog
  else if (weather.temp >= 20 && weather.humidity < 60) {
    advice = "Warm en droog weer – controleer bodemvocht";
  }

  return {
    field: field.name,
    advice,
  };
};

  if (loading)
    return <div className="dashboard-container p-6">Advies laden…</div>;

  return (
  <div className="dashboard-container p-6">
    <div className="page-header">
      <h1>📋 Smart Planner</h1>
      <p>Automatisch veldadvies op basis van actuele weersomstandigheden</p>
    </div>

    <div className="smartplanner-flex">

      {adviceList.map((item, idx) => (
        <div key={idx} className="smartplanner-card">
          {/* Header */}
          <div className="card-header">
            <h3>{item.field}</h3>
            <span className="status-badge">{item.fieldInfo.status}</span>
          </div>

          {/* Advice */}
          <div className="advice-box">
            <span className="advice-icon">💡</span>
            <div>
              <p className="advice-title">Advies</p>
              <p className="advice-text">{item.advice}</p>
            </div>
          </div>

          {/* Weather */}
          <div className="weather-box">
            <h4>🌦️ Weer</h4>
            <div className="weather-row">
              <span>{item.weather.condition}</span>
              <strong>{item.weather.temp}°C</strong>
            </div>
            <div className="weather-details">
              <span>💧 {item.weather.humidity}%</span>
              <span>💨 {item.weather.wind} km/h</span>
            </div>
          </div>

          {/* Field info */}
          <div className="field-info">
            <div><strong>Grootte:</strong> {item.fieldInfo.size} ha</div>
            <div><strong>Bodem:</strong> {item.fieldInfo.soil_type}</div>
            <div><strong>Volgende actie:</strong> {item.fieldInfo.next_action || "—"}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
};

// ✅ Belangrijk: default export
export default SmartPlanner;
