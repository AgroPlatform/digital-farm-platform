import React from 'react';
import './Help.css';

const Help: React.FC = () => {
  const faqs = [
    { q: 'Hoe kan ik een nieuw project aanmaken?', a: 'Ga naar de Projecten pagina en klik op de "Nieuw Project" knop rechtsboven.' },
    { q: 'Hoe voeg ik teamleden toe?', a: 'Navigeer naar de Team pagina en klik op "Voeg Lid Toe" om nieuwe teamleden uit te nodigen.' },
    { q: 'Waar kan ik mijn wachtwoord wijzigen?', a: 'Ga naar Instellingen > Beveiliging om uw wachtwoord te wijzigen.' },
    { q: 'Hoe upload ik documenten?', a: 'Klik op de Documenten pagina en gebruik de "Upload" knop om bestanden toe te voegen.' },
  ];

  return (
    <div className="help-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Help & Support</h1>
          <p>Vind antwoorden op uw vragen en neem contact met ons op</p>
        </div>
      </div>

      <div className="help-grid">
        <div className="help-main">
          <div className="help-card">
            <h2>📚 Veelgestelde Vragen</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="help-card">
            <h2>📖 Documentatie</h2>
            <div className="doc-grid">
              <div className="doc-item">
                <span className="doc-icon">🚀</span>
                <h3>Aan de Slag</h3>
                <p>Leer de basis van het platform</p>
              </div>
              <div className="doc-item">
                <span className="doc-icon">💼</span>
                <h3>Projectbeheer</h3>
                <p>Gids voor projectmanagement</p>
              </div>
              <div className="doc-item">
                <span className="doc-icon">👥</span>
                <h3>Team Samenwerking</h3>
                <p>Effectief samenwerken</p>
              </div>
              <div className="doc-item">
                <span className="doc-icon">📊</span>
                <h3>Analytics</h3>
                <p>Data analyseren en rapporteren</p>
              </div>
            </div>
          </div>
        </div>

        <div className="help-sidebar">
          <div className="contact-card">
            <h3>💬 Neem Contact Op</h3>
            <p>Heeft u een vraag? Ons team helpt u graag!</p>
            <div className="contact-methods">
              <div className="contact-method">
                <span className="method-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>support@agro.nl</p>
                </div>
              </div>
              <div className="contact-method">
                <span className="method-icon">📞</span>
                <div>
                  <strong>Telefoon</strong>
                  <p>+31 20 123 4567</p>
                </div>
              </div>
              <div className="contact-method">
                <span className="method-icon">💬</span>
                <div>
                  <strong>Live Chat</strong>
                  <p>Ma-Vr: 9:00-17:00</p>
                </div>
              </div>
            </div>
            <button className="contact-btn">Start een gesprek</button>
          </div>

          <div className="resources-card">
            <h3>🔗 Handige Links</h3>
            <ul className="resource-list">
              <li><a href="#">📘 Gebruikershandleiding</a></li>
              <li><a href="#">🎥 Video Tutorials</a></li>
              <li><a href="#">💡 Tips & Tricks</a></li>
              <li><a href="#">🐛 Bug Rapporteren</a></li>
              <li><a href="#">✨ Feature Aanvragen</a></li>
            </ul>
          </div>

          <div className="status-card">
            <h3>📡 Systeem Status</h3>
            <div className="status-indicator">
              <span className="status-dot online"></span>
              <div>
                <strong>Alle Systemen Operationeel</strong>
                <p>Laatste update: 2 minuten geleden</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;