import React, { useState } from 'react';
import './Calendar.css';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const events = [
    { id: 1, title: 'Team Meeting', date: '2026-01-28', time: '10:00', duration: '1h', type: 'meeting', color: '#4CAF50' },
    { id: 2, title: 'Project Deadline', date: '2026-01-30', time: '17:00', duration: 'all-day', type: 'deadline', color: '#ff4757' },
    { id: 3, title: 'Client Presentation', date: '2026-02-01', time: '14:00', duration: '2h', type: 'presentation', color: '#2196F3' },
    { id: 4, title: 'Code Review', date: '2026-01-29', time: '11:00', duration: '1h', type: 'meeting', color: '#9C27B0' },
    { id: 5, title: 'Sprint Planning', date: '2026-02-03', time: '09:00', duration: '3h', type: 'meeting', color: '#FF9800' },
    { id: 6, title: 'Design Workshop', date: '2026-02-05', time: '13:00', duration: '4h', type: 'workshop', color: '#00BCD4' },
    { id: 7, title: 'Product Demo', date: '2026-02-08', time: '15:00', duration: '1h', type: 'demo', color: '#E91E63' },
    { id: 8, title: 'Budget Review', date: '2026-02-10', time: '10:00', duration: '2h', type: 'meeting', color: '#FFC107' },
  ];

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Kalender</h1>
          <p>Plan en beheer al uw afspraken en evenementen</p>
        </div>
        <button className="primary-button">
          <span className="button-icon">➕</span>
          Nieuw Evenement
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-main">
          <div className="calendar-header">
            <button className="nav-btn" onClick={() => changeMonth(-1)}>
              ‹
            </button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button className="nav-btn" onClick={() => changeMonth(1)}>
              ›
            </button>
            <div className="view-selector">
              <button
                className={`view-option ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                Maand
              </button>
              <button
                className={`view-option ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button
                className={`view-option ${viewMode === 'day' ? 'active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                Dag
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {dayNames.map(day => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
            </div>
            <div className="calendar-days">
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${getEventsForDay(day).length > 0 ? 'has-events' : ''}`}
                >
                  {day && (
                    <>
                      <span className="day-number">{day}</span>
                      <div className="day-events">
                        {getEventsForDay(day).slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className="day-event"
                            style={{ backgroundColor: event.color }}
                            title={`${event.title} - ${event.time}`}
                          >
                            <span className="event-dot"></span>
                            <span className="event-title">{event.title}</span>
                          </div>
                        ))}
                        {getEventsForDay(day).length > 3 && (
                          <div className="more-events">
                            +{getEventsForDay(day).length - 3} meer
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="calendar-sidebar">
          <div className="mini-calendar">
            <h3>Vandaag</h3>
            <div className="today-info">
              <div className="today-date">{new Date().getDate()}</div>
              <div>
                <div className="today-day">{dayNames[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}</div>
                <div className="today-month">{monthNames[new Date().getMonth()]}</div>
              </div>
            </div>
          </div>

          <div className="upcoming-events">
            <h3>Aankomende Evenementen</h3>
            <div className="events-list">
              {upcomingEvents.map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-color-bar" style={{ backgroundColor: event.color }}></div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    <div className="event-meta">
                      <span className="event-date">
                        📅 {new Date(event.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="event-time">
                        🕐 {event.time}
                      </span>
                    </div>
                    <span className={`event-type ${event.type}`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="event-categories">
            <h3>Categorieën</h3>
            <div className="categories-list">
              <div className="category-item">
                <span className="category-color" style={{ backgroundColor: '#4CAF50' }}></span>
                <span>Meetings</span>
                <span className="category-count">12</span>
              </div>
              <div className="category-item">
                <span className="category-color" style={{ backgroundColor: '#2196F3' }}></span>
                <span>Presentaties</span>
                <span className="category-count">5</span>
              </div>
              <div className="category-item">
                <span className="category-color" style={{ backgroundColor: '#ff4757' }}></span>
                <span>Deadlines</span>
                <span className="category-count">8</span>
              </div>
              <div className="category-item">
                <span className="category-color" style={{ backgroundColor: '#9C27B0' }}></span>
                <span>Workshops</span>
                <span className="category-count">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;