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
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  const mapField = (field: ApiField): Field => {
    const crop = field.last_crop ?? field.crops?.[0] ?? "Onbekend";
    const status: Field["status"] = field.status === "inactief" ? "Geoogst" : "Groei";
    const progress = status === "Geoogst" ? 100 : status === "Groei" ? 60 : 20;

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
        const userRes = await fetch("http://localhost:8000/user/profile", {
          credentials: "include",
        });
        const userJson = await userRes.json();
        setUser(userJson);

        // 2️⃣ Haal velden op
  const fieldsData = await fieldsApi.getFields();
  const mappedFields = fieldsData.map(mapField);
  setFields(mappedFields);

        // 3️⃣ Haal weer op
        const weatherRes = await fetch("http://localhost:8000/weather?city=Antwerpen");
        const weatherJson = await weatherRes.json();
        setWeather({
          temp: Math.round(weatherJson.main.temp),
          condition: weatherJson.weather[0].description,
          humidity: weatherJson.main.humidity,
          wind: Math.round(weatherJson.wind.speed * 3.6),
        });

        // 4️⃣ Genereer recente activiteiten
        const recentActivities: Activity[] = mappedFields.slice(0, 4).map((field) => ({
          user: field.name,
          action: `${field.crop} status: ${field.status}`,
          time: "Vandaag",
          icon: "🌱",
        }));
        setActivities(recentActivities);

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

  const harvestStatus = totalFields > 0 ? Math.round((activeFields / totalFields) * 100) : 0;

  const stats: Array<{
    title: string;
    value: number | string;
    icon: string;
    change?: string;
  }> = [
    { title: "Totaal Velden", value: totalFields, icon: "🌾" },
    { title: "Actieve Gewassen", value: totalCrops, icon: "🌽" },
    { title: "Oppervlakte", value: `${totalArea} ha`, icon: "📏" },
    { title: "Oogst Status", value: `${harvestStatus}%`, icon: "📊" },
  ];

  return (
    <>
      {/* Welkom terug */}
      <div className="content-header">
        <h2>Welkom terug, {user?.full_name || user?.email || "Jan de Boer"}!</h2>
        <p>
          Vandaag is het {weather?.condition?.toLowerCase() || "onbekend"}, {weather?.temp || "--"}°C - Perfect weer voor veldwerk.
        </p>
      </div>

      {/* Statistieken */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              {stat.change && (
                <span className="stat-change positive">{stat.change}</span>
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

      {/* Two-column layout */}
      <div className="content-grid">
        {/* Fields */}
        <div className="content-card">
          <div className="card-header">
            <h3>Veld Overzicht</h3>
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recente Updates</h3>
          </div>
          <div className="activities-list">
            {activities.map((activity, idx) => (
              <div className="activity-item" key={idx}>
                <div className="activity-avatar" style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)' }}>
                  {activity.icon}
                </div>
                <div className="activity-content">
                  <p><strong>{activity.user}</strong> - {activity.action}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
