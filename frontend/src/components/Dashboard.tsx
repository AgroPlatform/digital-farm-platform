import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import * as fieldsApi from "../api/fields";
import type { Field as ApiField } from "../api/fields";

interface User {
  email: string;
  full_name?: string;
}

interface Field {
  id: number;
  name: string;
  size: number;
  status: "Plantfase" | "Groei" | "Geoogst";
  crop: string;
  progress: number;
}

interface Activity {
  user: string;
  action: string;
  time: string;
  icon: string;
  type: "info" | "warning" | "success";
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

interface Alert {
  id: number;
  title: string;
  message: string;
  type: "warning" | "info" | "error";
  fieldId?: number;
}

const Dashboard: React.FC = () => {
  const rawApiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
  const apiBaseUrl = rawApiUrl.replace(/\/+$/, "");
  const [user, setUser] = useState<User | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const mapField = (field: ApiField): Field => {
    const crop = field.crops?.[0] ?? "Onbekend";
    const status: Field["status"] = field.status === "inactief" ? "Geoogst" : "Groei";
    // Use the calculated progress from backend (rounded to whole number)
    const progress = Math.round(field.progress ?? 0);

    return {
      id: field.id,
      name: field.name,
      size: field.size,
      status,
      crop,
      progress,
    };
  };

  useEffect(() => {
    async function loadData() {
      try {
        // 1️⃣ Haal user info op
        const userRes = await fetch(`${apiBaseUrl}/user/profile`, {
          credentials: "include",
        });
        const userJson = await userRes.json();
        setUser(userJson);

        // 2️⃣ Haal velden op
        const fieldsData = await fieldsApi.getFields();
        const mappedFields = fieldsData.map(mapField);
        setFields(mappedFields);

        // 3️⃣ Haal weer op
  const weatherRes = await fetch(`${apiBaseUrl}/weather?city=Antwerpen`);
        const weatherJson = await weatherRes.json();
        setWeather({
          temp: Math.round(weatherJson.main.temp),
          condition: weatherJson.weather[0].description,
          humidity: weatherJson.main.humidity,
          wind: Math.round(weatherJson.wind.speed * 3.6),
        });

        // 4️⃣ Genereer recente activiteiten en alerts
        const recentActivities: Activity[] = mappedFields.slice(0, 4).map((field) => ({
          user: field.name,
          action: `${field.crop} status: ${field.status}`,
          time: "Vandaag",
          icon: "🌱",
          type: field.status === "Geoogst" ? "warning" : "info",
        }));
        setActivities(recentActivities);

        // 5️⃣ Genereer alerts
        const generatedAlerts: Alert[] = [];
        mappedFields.forEach((field) => {
          if (field.status === "Groei" && field.progress > 80) {
            generatedAlerts.push({
              id: field.id * 100,
              title: "Oogstvoorbereiding nodig",
              message: `Veld "${field.name}" is bijna volgroeid. Begin met voorbereiding voor oogst.`,
              type: "warning",
              fieldId: field.id,
            });
          }
        });
        setAlerts(generatedAlerts);

      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading)
    return <div className="dashboard-container p-6">Dashboard laden…</div>;

  // Statistieken berekenen
  const totalFields = fields.length;
  const activeFields = fields.filter(f => f.status !== "Geoogst").length;
  const totalCrops = fields.reduce((sum, f) => sum + 1, 0); // 1 per veld
  const totalArea = fields.reduce((sum, f) => sum + f.size, 0);
  const avgProgress = fields.length > 0 ? Math.round(fields.reduce((sum, f) => sum + f.progress, 0) / fields.length) : 0;

  const harvestStatus = totalFields > 0 ? Math.round((activeFields / totalFields) * 100) : 0;

  const stats: Array<{
    title: string;
    value: number | string;
    icon: string;
    change?: string;
    trend?: "up" | "down";
  }> = [
    { title: "Totaal Velden", value: totalFields, icon: "🌾" },
    { title: "Actieve Gewassen", value: totalCrops, icon: "🌽" },
    { title: "Oppervlakte", value: `${totalArea} ha`, icon: "📏" },
    { title: "Gemiddelde Groei", value: `${avgProgress}%`, icon: "📈" },
  ];

  // Filter alerts
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  const dismissAlert = (id: number) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  return (
    <>
      {/* Welkom terug */}
      <div className="content-header">
        <h2>Welkom terug, {user?.full_name || user?.email || "Jan de Boer"}!</h2>
        <p>
          Vandaag is het {weather?.condition?.toLowerCase() || "onbekend"}, {weather?.temp || "--"}°C - Perfect weer voor veldwerk.
        </p>
      </div>

      {/* Alerts Section */}
      {visibleAlerts.length > 0 && (
        <div className="alerts-container">
          {visibleAlerts.map((alert) => (
            <div key={alert.id} className={`alert alert-${alert.type}`}>
              <span className="alert-icon">
                {alert.type === "warning" ? "⚠️" : alert.type === "error" ? "❌" : "ℹ️"}
              </span>
              <div className="alert-content">
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
              </div>
              <button 
                className="alert-close"
                onClick={() => dismissAlert(alert.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Statistieken */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              {stat.change && (
                <span className={`stat-change ${stat.trend === "up" ? "positive" : "negative"}`}>
                  {stat.trend === "up" ? "↑" : "↓"} {stat.change}
                </span>
              )}
            </div>
            <h3 className="stat-value">{stat.value}</h3>
            <p className="stat-title">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Weather Card */}
      {weather && (
        <div className="content-card" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>🌤️ Huidig Weer</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Boerderij De Groene Akker</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1 }}>{weather.temp}°C</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>{weather.condition}</div>
            </div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px', 
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>💧 Vochtigheid</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{weather.humidity}%</div>
            </div>
            <div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>💨 Wind</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{weather.wind} km/h</div>
            </div>
          </div>
        </div>
      )}

      {/* Snelkoppelingen */}
      {/* <div className="quick-actions-section">
        <h3 className="section-title">Snelkoppelingen</h3>
        <div className="quick-actions">
          <button className="action-button">
            <span className="action-icon">➕</span>
            Nieuw Veld
          </button>
          <button className="action-button">
            <span className="action-icon">📅</span>
            Plant Planning
          </button>
          <button className="action-button">
            <span className="action-icon">📊</span>
            Rapporten
          </button>
          <button className="action-button">
            <span className="action-icon">🌾</span>
            Oogst Plannenen
          </button>
        </div>
      </div> */}

      {/* Two-column layout */}
      <div className="content-grid">
        {/* Fields */}
        <div className="content-card">
          <div className="card-header">
            <h3>Veld Overzicht</h3>
            <span className="card-badge">{fields.length} velden</span>
          </div>
          <div className="projects-list">
            {fields.map((field) => (
              <div className="project-item" key={field.id}>
                <div className="project-info">
                  <h4>{field.name}</h4>
                  <div className="project-meta">
                    <span className={`project-status ${field.status === "Geoogst" ? "" : "actief"}`}>{field.status}</span>
                    <span className="project-team">🌱 {field.crop}</span>
                    <span className="project-team">📏 {field.size} ha</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${field.progress}%` }}></div>
                  </div>
                  <div className="progress-text">{field.progress}% Volgroeid</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recente Updates</h3>
            <span className="card-badge">{activities.length} updates</span>
          </div>
          <div className="activities-list">
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div className="activity-item" key={idx}>
                  <div className={`activity-avatar activity-${activity.type}`}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <p><strong>{activity.user}</strong> - {activity.action}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Geen recente activiteiten</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
