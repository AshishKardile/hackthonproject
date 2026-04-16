import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { FiTrendingUp, FiCalendar, FiCheckSquare, FiZap } from 'react-icons/fi';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch wellness, GPA, attendance, gamification dynamically. If fail/new, start at 0
    api.get('/student/dashboard').then(res => setData(res.data)).catch(() => {
      setData({
        wellness: { mood: 'Neutral', stress_level: 0, score: 0 },
        gpa: '0.00',
        attendance: 0,
        pendingAssignments: 0,
        gamification: { points: 0, level: 0, streak_days: 0 },
      });
    });
  }, []);

  const d = data || { 
    wellness: { score: 0, mood: 'Neutral' },
    gpa: '0.00', 
    attendance: 0, 
    pendingAssignments: 0, 
    gamification: { points: 0, streak_days: 0, level: 0 } 
  };

  const moodData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0], // Defaults to 0 trending
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      borderWidth: 3, fill: true, tension: 0.4,
      pointBackgroundColor: '#3b82f6', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', cornerRadius: 8 } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }, border: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }, border: { display: false }, min: 0, max: 100 },
    },
  };

  const tasks = [
    { name: 'Data Structures Algo', pct: 0, color: '#3b82f6' },
    { name: 'Operating Systems', pct: 0, color: '#8b5cf6' },
    { name: 'Computer Networks', pct: 0, color: '#ec4899' },
    { name: 'Mathematics', pct: 0, color: '#10b981' },
    { name: 'Database Management Systems (DBMS)', pct: 0, color: '#f59e0b' },
  ];

  const events = [
    { time: '09:00', name: 'Data Structures and Algorithms (DSA)', meta: 'Room 201', color: '#3b82f6' },
    { time: '10:00', name: 'Database Management Systems (DBMS)', meta: 'Room 202', color: '#8b5cf6' },
    { time: '11:00', name: 'Mathematics', meta: 'Room 203', color: '#ec4899' },
    { time: '14:00', name: 'Operating Systems (OS)', meta: 'Lab 3', color: '#10b981' },
    { time: '15:30', name: 'Computer Networks', meta: 'Room 105', color: '#f59e0b' },
  ];

  return (
    <>
      {/* Wellness Hero */}
      <div className="hero-card student">
        <div className="hero-card-pattern" />
        <div className="hero-content">
          <div>
            <p className="hero-label">Wellness Score</p>
            <h1 className="hero-value">{d.wellness.score || 0}<span className="hero-unit">/100</span></h1>
            <p className="hero-status"><span className="status-dot good" /> Current Mood: {d.wellness.mood || 'Neutral'}</p>
          </div>
          <div style={{ width: 90, height: 90, position: 'relative' }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 - ((d.wellness.score || 0) / 100) * 264} />
            </svg>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '28px' }}>❤️</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><FiCheckSquare size={22} /></div>
          <div><p className="stat-value">Level {d.gamification.level || 0}</p><p className="stat-label">Gamification Level</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FiCalendar size={22} /></div>
          <div><p className="stat-value">{d.attendance || 0}%</p><p className="stat-label">Attendance</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiCheckSquare size={22} /></div>
          <div><p className="stat-value">{d.pendingAssignments || 0}</p><p className="stat-label">Assignments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiZap size={22} /></div>
          <div><p className="stat-value">{d.gamification.streak_days || 0}🔥</p><p className="stat-label">Day Streak</p></div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Mood Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Mood Trends</h3>
            <span className="badge blue">Weekly</span>
          </div>
          <div className="chart-wrapper"><Line data={moodData} options={chartOpts} /></div>
        </div>

        {/* Task Progress */}
        <div className="card">
          <div className="card-header"><h3>Task Progress</h3><a href="#" style={{ fontSize: '0.82rem', fontWeight: 600 }}>See All</a></div>
          {tasks.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 4, height: 36, borderRadius: 4, background: t.color }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 6 }}>{t.name}</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${t.pct}%`, background: t.color }} /></div>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.pct}%</span>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="card full-width">
          <div className="card-header"><h3>Upcoming Subjects</h3><span className="badge pink">Today</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: 44 }}>{ev.time}</span>
                <div style={{ width: 4, height: 40, borderRadius: 4, background: ev.color }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>{ev.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{ev.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
