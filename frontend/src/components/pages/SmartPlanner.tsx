import React, { useEffect, useState } from "react";
import "./SmartPlanner.css";
import * as fieldsApi from "../../api/fields";

interface Field {
  id: number;
  name: string;
  size: number;
  soil_type: string;
  crops: string[];
  status: "actief" | "inactief";
  last_crop: string;
  next_action: string;
  address: string;
  lat: number;
  lng: number;
  user_id: number;
}

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
          // default weather
          let weather: WeatherData = {
            temp: 20,
            condition: "onbekend",
            humidity: 78,
            wind: 0,
          };

          if (field.lat && field.lng) {
            try {
              const weatherRes = await fetch(
                `http://localhost:8000/weather?lat=${field.lat}&lng=${field.lng}`
              );
              if (weatherRes.ok) {
                const weatherJson = await weatherRes.json();
                weather = {
                  temp: Math.round(weatherJson.main?.temp || 20),
                  condition: weatherJson.weather?.[0]?.description || "onbekend",
                  humidity: weatherJson.main?.humidity || 78,
                  wind: Math.round((weatherJson.wind?.speed || 0) * 3.6),
                };
              }
            } catch (err) {
              console.warn(`Weather fetch failed for ${field.name}`, err);
            }
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
    let advice = "Geen actie nodig";

    if (field.status === "actief") {
      if (field.crops.includes("Tarwe")) {
        advice = weather.temp > 10 ? "Irrigatie aanbevolen voor Tarwe" : "Nog even wachten met irrigatie";
      }
      if (field.crops.includes("Maïs")) {
        advice = weather.temp > 15 ? "Bemesting Maïs uitvoeren" : "Bemesting uitstellen";
      }
      if (field.crops.includes("Aardappelen")) {
        advice = weather.humidity > 70 ? "Controleer op schimmels bij Aardappelen" : "Alles goed";
      }
    }

    return { field: field.name, advice };
  };

  if (loading) return <div className="dashboard-container p-6">Advies laden…</div>;

  return (
    <div className="dashboard-container p-6">
      <div className="content-grid">
        {adviceList.map((item, idx) => (
          <div
            key={idx}
            className="content-card"
            style={{
              borderLeft: "4px solid #FFA500",
              padding: "20px",
            }}
          >
            <h3>{item.field}</h3>
            <p><strong>Advies:</strong> {item.advice}</p>
            <p><strong>Grootte:</strong> {item.fieldInfo.size} ha</p>
            <p><strong>Bodemtype:</strong> {item.fieldInfo.soil_type}</p>
            <p><strong>Status:</strong> {item.fieldInfo.status}</p>
            <p><strong>Laatste gewas:</strong> {item.fieldInfo.last_crop}</p>
            <p><strong>Volgende actie:</strong> {item.fieldInfo.next_action}</p>
            <hr style={{ margin: "10px 0" }} />
            <p><strong>Weer:</strong> {item.weather.condition}, {item.weather.temp}°C</p>
            <p>💧 Vochtigheid: {item.weather.humidity}% | 💨 Wind: {item.weather.wind} km/h</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartPlanner;