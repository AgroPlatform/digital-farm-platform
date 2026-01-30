import React, { useEffect, useState } from "react";
import "./Advice.css";
import * as fieldsApi from "../../api/fields";
import type { Field } from "../../api/fields";

type WeatherDataStatus = "ok" | "failed" | "stale";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  dataStatus: WeatherDataStatus;
  timestamp: string;
}

interface ForecastEntry {
  timestamp: string;
  temp: number;
  pop: number;
  rainMm: number;
  wind: number;
}

interface ForecastWindowSummary {
  hours: number;
  totalRainMm: number;
  maxPop: number;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  avgWind: number;
}

interface WindWindow {
  start: string;
  end: string;
  avgWind: number;
}

interface ForecastSummary {
  start: string;
  end: string;
  next24: ForecastWindowSummary | null;
  next72: ForecastWindowSummary | null;
  trend: "warming" | "cooling" | "stable";
  lowWindWindows: WindWindow[];
  highWindWindows: WindWindow[];
}

interface ForecastData {
  entries: ForecastEntry[];
  summary: ForecastSummary | null;
  dataStatus: WeatherDataStatus;
}

interface Advice {
  field: string;
  advice: string;
  weather: WeatherData;
  forecast: ForecastData;
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

function extractCity(address?: string): string | null {
  if (!address) return null;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const lastPart = parts[parts.length - 1];
  return lastPart || null;
}

function buildForecastEntries(forecastJson: any): ForecastEntry[] {
  const list = Array.isArray(forecastJson?.list) ? forecastJson.list : [];
  return list
    .map((item: any) => ({
      timestamp: item.dt_txt || new Date(item.dt * 1000).toISOString(),
      temp: item.main?.temp ?? 0,
      pop: item.pop ?? 0,
      rainMm: item.rain?.["3h"] ?? 0,
      wind: Math.round((item.wind?.speed ?? 0) * 3.6),
    }))
    .filter((entry: ForecastEntry) => Boolean(entry.timestamp));
}

function summarizeForecast(entries: ForecastEntry[]): ForecastSummary | null {
  if (entries.length === 0) return null;
  const now = Date.now();
  const next72Cutoff = now + 72 * 60 * 60 * 1000;
  const upcoming = entries
    .map((entry) => ({ ...entry, time: new Date(entry.timestamp).getTime() }))
    .filter((entry) => entry.time >= now && entry.time <= next72Cutoff)
    .sort((a, b) => a.time - b.time);

  if (upcoming.length === 0) return null;

  const buildWindow = (hours: number): ForecastWindowSummary | null => {
    const cutoff = now + hours * 60 * 60 * 1000;
    const windowEntries = upcoming.filter((entry) => entry.time <= cutoff);
    if (windowEntries.length === 0) return null;
    const temps = windowEntries.map((entry) => entry.temp);
    const winds = windowEntries.map((entry) => entry.wind);
    const totalRainMm = windowEntries.reduce((sum, entry) => sum + entry.rainMm, 0);
    const maxPop = Math.max(...windowEntries.map((entry) => entry.pop));
    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    const avgWind = winds.reduce((sum, wind) => sum + wind, 0) / winds.length;
    return {
      hours,
      totalRainMm,
      maxPop,
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps),
      avgTemp,
      avgWind,
    };
  };

  const next24 = buildWindow(24);
  const next72 = buildWindow(72);

  const first24 = upcoming.filter((entry) => entry.time <= now + 24 * 60 * 60 * 1000);
  const last24 = upcoming.filter(
    (entry) => entry.time >= now + 48 * 60 * 60 * 1000 && entry.time <= next72Cutoff
  );
  const avgTemp = (items: typeof upcoming) =>
    items.reduce((sum, entry) => sum + entry.temp, 0) / (items.length || 1);
  const tempDelta = avgTemp(last24) - avgTemp(first24);
  const trend = tempDelta > 1.5 ? "warming" : tempDelta < -1.5 ? "cooling" : "stable";

  const lowWindWindows: WindWindow[] = [];
  const highWindWindows: WindWindow[] = [];
  const addWindow = (bucket: WindWindow[], startIdx: number, endIdx: number, avgWind: number) => {
    const start = upcoming[startIdx];
    const end = upcoming[endIdx];
    bucket.push({
      start: start.timestamp,
      end: end.timestamp,
      avgWind,
    });
  };

  let lowStart = 0;
  let inLow = false;
  let lowWindSum = 0;
  let lowCount = 0;
  let highStart = 0;
  let inHigh = false;
  let highWindSum = 0;
  let highCount = 0;

  upcoming.forEach((entry, idx) => {
    const isLow = entry.wind <= 15;
    const isHigh = entry.wind >= 30;
    if (isLow) {
      if (!inLow) {
        inLow = true;
        lowStart = idx;
        lowWindSum = 0;
        lowCount = 0;
      }
      lowWindSum += entry.wind;
      lowCount += 1;
    } else if (inLow) {
      if (idx - lowStart >= 2) {
        addWindow(lowWindWindows, lowStart, idx - 1, lowWindSum / lowCount);
      }
      inLow = false;
    }

    if (isHigh) {
      if (!inHigh) {
        inHigh = true;
        highStart = idx;
        highWindSum = 0;
        highCount = 0;
      }
      highWindSum += entry.wind;
      highCount += 1;
    } else if (inHigh) {
      if (idx - highStart >= 2) {
        addWindow(highWindWindows, highStart, idx - 1, highWindSum / highCount);
      }
      inHigh = false;
    }
  });

  if (inLow && upcoming.length - lowStart >= 2) {
    addWindow(lowWindWindows, lowStart, upcoming.length - 1, lowWindSum / lowCount);
  }

  if (inHigh && upcoming.length - highStart >= 2) {
    addWindow(highWindWindows, highStart, upcoming.length - 1, highWindSum / highCount);
  }

  return {
    start: upcoming[0].timestamp,
    end: upcoming[upcoming.length - 1].timestamp,
    next24,
    next72,
    trend,
    lowWindWindows,
    highWindWindows,
  };
}

function formatForecastMoment(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const dayDiff = Math.floor(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const time = date.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
  if (dayDiff === 0) return `vandaag rond ${time}`;
  if (dayDiff === 1) return `morgen rond ${time}`;
  return `${date.toLocaleDateString("nl-BE", { weekday: "short" })} ${time}`;
}

const Advice: React.FC = () => {
  const rawApiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
  const apiBaseUrl = rawApiUrl.replace(/\/+$/, "");
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
            dataStatus: "failed",
            timestamp: new Date().toISOString(),
          };
          let forecast: ForecastData = {
            entries: [],
            summary: null,
            dataStatus: "failed",
          };

          try {
            const city = extractCity(field.address) || "Antwerpen";
            const weatherUrl =
              field.lat != null && field.lng != null
                ? `${apiBaseUrl}/weather?lat=${field.lat}&lng=${field.lng}`
                : `${apiBaseUrl}/weather?city=${encodeURIComponent(city)}`;

            const weatherRes = await fetch(weatherUrl, {
              credentials: "include",
            });

            if (weatherRes.ok) {
              const weatherJson = await weatherRes.json();
              weather = {
                temp: Math.round(weatherJson.main?.temp || 20),
                condition: weatherJson.weather?.[0]?.description || "onbekend",
                humidity: weatherJson.main?.humidity || 78,
                wind: Math.round((weatherJson.wind?.speed || 0) * 3.6),
                dataStatus: "ok",
                timestamp: new Date().toISOString(),
              };
            } else {
              weather = {
                ...weather,
                condition: "Niet beschikbaar",
                dataStatus: "failed",
                timestamp: new Date().toISOString(),
              };
            }

            const forecastUrlPrimary =
              field.lat != null && field.lng != null
                ? `${apiBaseUrl}/weather/forecast?lat=${field.lat}&lng=${field.lng}`
                : `${apiBaseUrl}/weather/forecast?city=${encodeURIComponent(city)}`;
            const forecastResPrimary = await fetch(forecastUrlPrimary, {
              credentials: "include",
            });

            let forecastRes = forecastResPrimary;
            if (
              !forecastResPrimary.ok &&
              field.lat != null &&
              field.lng != null &&
              city
            ) {
              const forecastUrlFallback = `${apiBaseUrl}/weather/forecast?city=${encodeURIComponent(
                city
              )}`;
              forecastRes = await fetch(forecastUrlFallback, {
                credentials: "include",
              });
            }

            if (forecastRes.ok) {
              const forecastJson = await forecastRes.json();
              const entries = buildForecastEntries(forecastJson);
              forecast = {
                entries,
                summary: summarizeForecast(entries),
                dataStatus: "ok",
              };
            } else {
              forecast = {
                ...forecast,
                dataStatus: "failed",
              };
            }
          } catch (err) {
            console.warn(`Weather fetch failed for ${field.name}`, err);
            weather = {
              ...weather,
              condition: "Niet beschikbaar",
              dataStatus: "failed",
              timestamp: new Date().toISOString(),
            };
            forecast = {
              ...forecast,
              dataStatus: "failed",
            };
          }

          adviceArr.push({
            ...generateAdvice(field, weather, forecast),
            weather,
            forecast,
            fieldInfo: field,
          });
        }

        setAdviceList(adviceArr);
      } catch (err) {
        console.error("Advice load error", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const generateAdvice = (field: Field, weather: WeatherData, forecast: ForecastData) => {
    const advices: string[] = [];

    if (weather.dataStatus !== "ok") {
      return {
        field: field.name,
        advice: "⚠️ Geen advies door ontbrekende weerdata",
      };
    }

    const weatherBlock = getWeatherBlockingAdvice(weather);
    if (weatherBlock) advices.push(weatherBlock);

    if (field.crops && field.crops.length > 0) {
      field.crops.forEach((crop) => {
        advices.push(...getCropAdvice(crop, weather));
      });
    } else {
      advices.push("ℹ️ Geen gewassen gekoppeld aan dit veld");
    }

    if (forecast.dataStatus === "ok" && forecast.summary) {
      const { next24, next72, trend, lowWindWindows, highWindWindows } = forecast.summary;
      if (next24) {
        if (next24.maxPop >= 0.6 || next24.totalRainMm >= 5) {
          advices.push(
            `🌧️ Kans op regen binnen 24 uur (${Math.round(
              next24.maxPop * 100
            )}% / ~${Math.round(next24.totalRainMm)} mm): stel irrigatie uit`
          );
        }
      }
      if (next72) {
        if (next72.totalRainMm >= 10) {
          advices.push(
            `🌦️ Verwachte neerslag komende 72 uur: ~${Math.round(
              next72.totalRainMm
            )} mm – houd bodem en drainage in de gaten`
          );
        }
        if (trend === "warming" && next72.maxTemp >= 28) {
          advices.push(
            "🔥 Opwarming verwacht de komende dagen: plan irrigatie en voorkom hittestress"
          );
        }
        if (trend === "cooling" && next72.minTemp <= 4) {
          advices.push(
            "🥶 Afkoeling verwacht: bescherm gevoelige gewassen en vermijd koudegevoelige behandelingen"
          );
        }
      }
      if (lowWindWindows.length > 0) {
        const window = lowWindWindows[0];
        advices.push(
          `💨 Lage wind verwacht ${formatForecastMoment(
            window.start
          )}: geschikt moment voor bespuiting`
        );
      }
      if (highWindWindows.length > 0) {
        const window = highWindWindows[0];
        advices.push(
          `🌬️ Windpieken verwacht ${formatForecastMoment(
            window.start
          )}: stel spuit- en mestwerk uit`
        );
      }
    } else {
      advices.push("⏱️ Geen korte-termijnverwachting beschikbaar voor planning");
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
        <h1>💡 Advies</h1>
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
                  {item.weather.dataStatus !== "ok" && (
                    <div className="advice-warning">
                      Weerdata niet beschikbaar; advies onvolledig
                    </div>
                  )}
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
                {item.weather.dataStatus !== "ok" && (
                  <div className="weather-status warning">⚠️ Weerdata niet beschikbaar</div>
                )}
                <div className="weather-row">
                  <span>{item.weather.condition}</span>
                  <strong>
                    {item.weather.dataStatus === "ok" ? `${item.weather.temp}°C` : "—"}
                  </strong>
                </div>
                <div
                  className={`weather-details ${
                    item.weather.dataStatus === "ok" ? "" : "weather-details-muted"
                  }`}
                >
                  <span>💧 {item.weather.dataStatus === "ok" ? `${item.weather.humidity}%` : "—"}</span>
                  <span>💨 {item.weather.dataStatus === "ok" ? `${item.weather.wind} km/h` : "—"}</span>
                </div>
                <div className="weather-timestamp">
                  ⏱️ Laatste update:{" "}
                  {new Date(item.weather.timestamp).toLocaleString("nl-NL")}
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

export default Advice;
