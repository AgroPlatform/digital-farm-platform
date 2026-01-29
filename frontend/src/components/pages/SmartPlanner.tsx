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

function getWeatherBlockingAdvice(weather: WeatherData): string | null {
  if (weather.temp <= 2) {
    return "❄️ Vorstgevaar – vermijd veldwerk";
  }

  if (weather.wind >= 40) {
    return "🌪️ Te veel wind – niet sproeien of bemesten";
  }

  if (
    weather.condition.toLowerCase().includes("regen") ||
    weather.condition.toLowerCase().includes("rain")
  ) {
    return "🌧️ Regen verwacht – geen irrigatie nodig";
  }

  return null;
}

function getCropAdvice(crop: string, weather: WeatherData): string[] {
  const advice: string[] = [];

  switch (crop) {
    case "Aardappelen":
      if (weather.humidity > 80)
        advice.push("🥔 Hoog risico op Phytophthora: inspecteer knollen en overweeg bespuiting");
      if (weather.temp < 8)
        advice.push("🥔 Groei vertraagd door koude: plan activiteiten die gevoelig zijn voor lage temperatuur");
      if (weather.temp > 25)
        advice.push("🥔 Hittestress: controleer bodemvocht en geef indien nodig irrigatie");
      break;

    case "Tarwe":
      if (weather.humidity > 85)
        advice.push("🌾 Bladziekten mogelijk: inspecteer gewas en overweeg fungicide");
      if (weather.temp > 12 && weather.temp <= 27)
        advice.push("🌾 Goede groeicondities: voer standaard verzorging uit");
      if (weather.temp > 27)
        advice.push("🌾 Hitte: versneld afrijpingsrisico, oogstplanning in de gaten houden");
      break;

    case "Maïs":
      if (weather.temp < 10)
        advice.push("🌽 Groeistilstand door lage temperatuur: vermijd bemesting of bespuiting die groei stimuleert");
      if (weather.wind > 25)
        advice.push("🌽 Sterke wind: stel bespuiting en irrigatie uit");
      if (weather.temp >= 32)
        advice.push("🌽 Zeer warm: zorg voor voldoende bodemvocht, controleer planten op stress");
      break;

    case "Suikerbieten":
      if (weather.temp > 15 && weather.temp <= 28)
        advice.push("🍬 Actieve groeifase: blijf irrigatie volgen en controleer gewasontwikkeling");
      if (weather.temp > 28)
        advice.push("🍬 Hoge temperaturen: verhoogde kans op stress en lagere suikeropbrengst, irrigatie controleren");
      if (weather.humidity > 85)
        advice.push("🍬 Bladschimmel mogelijk: inspecteer bladeren en behandel indien nodig");
      break;

    case "Gerst":
      if (weather.humidity > 80)
        advice.push("🌾 Schimmelrisico: inspecteer gewas en pas fungicide toe indien nodig");
      if (weather.temp > 27)
        advice.push("🌾 Hitte: versnelde afrijping, controleer rijpingsstadium voor oogstplanning");
      break;

    case "Uien":
      if (weather.humidity > 75)
        advice.push("🧅 Kans op valse meeldauw: inspecteer bladeren, behandel indien nodig");
      if (weather.temp > 30)
        advice.push("🧅 Warm weer: verhoog watergift en vermijd stress op het gewas");
      break;

    case "Wortelen":
      if (weather.temp < 7)
        advice.push("🥕 Trage wortelontwikkeling: pas bemesting en oogstplanning aan");
      if (weather.temp > 25)
        advice.push("🥕 Warm weer: verhoog watergift, controleer op droogtestress");
      break;

    case "Spinazie":
      if (weather.temp > 20 && weather.temp <= 28)
        advice.push("🥬 Ideale groei: standaard verzorging uitvoeren");
      if (weather.temp > 28)
        advice.push("🥬 Te warm: kans op doorschieten en bladverbranding, irrigatie verhogen");
      if (weather.humidity > 80)
        advice.push("🥬 Hoog risico op bladschimmels: inspecteer bladeren en behandel indien nodig");
      break;

    default:
      advice.push(`🌱 ${crop}: geen specifieke actie beschikbaar`);
  }

  return advice;
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
          let weather: WeatherData = {
            temp: 20,
            condition: "onbekend",
            humidity: 78,
            wind: 0,
          };

          try {
            const cityRes = await fetch(
              `http://localhost:8000/fields/${field.id}/city`,
              { credentials: "include" }
            );

            let city = "Antwerpen";
            if (cityRes.ok) {
              const cityJson = await cityRes.json();
              if (cityJson.city) city = cityJson.city;
            }

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
    const advices: string[] = [];

    const weatherBlock = getWeatherBlockingAdvice(weather);
    if (weatherBlock) advices.push(weatherBlock);

    if (field.crops && field.crops.length > 0) {
      field.crops.forEach((crop) => {
        advices.push(...getCropAdvice(crop, weather));
      });
    } else {
      advices.push("ℹ️ Geen gewassen gekoppeld aan dit veld");
    }

    if (advices.length === 0) advices.push("✅ Geen actie nodig");

    return {
      field: field.name,
      advice: advices.join(" • "),
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

      {fields.length === 0 ? (
        <div className="no-fields-message">
          ℹ️ Geen velden toegevoegd. Voeg eerst een veld toe om advies te ontvangen.
        </div>
      ) : (
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
                  <div className="advice-text">
                    {item.advice.split(" • ").map((line, i) => (
                      <div key={i}>• {line}</div>
                    ))}
                  </div>
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
                <div>
                  <strong>Grootte:</strong> {item.fieldInfo.size} ha
                </div>
                <div>
                  <strong>Bodem:</strong> {item.fieldInfo.soil_type}
                </div>
                <div>
                  <strong>Volgende actie:</strong> {item.fieldInfo.next_action || "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartPlanner;