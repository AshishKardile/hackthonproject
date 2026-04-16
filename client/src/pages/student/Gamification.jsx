import { useState } from 'react';

export default function StudentGamification() {
  const [xp, setXp] = useState(0); // Starts at 0
  const [streakDays, setStreakDays] = useState(0); // Starts at 0

  const [gameTasks, setGameTasks] = useState([
    { id: 1, title: 'Code Breaker (DSA)', xp: 150, completed: false },
    { id: 2, title: 'SQL Syntax Solver', xp: 120, completed: false },
    { id: 3, title: 'Algorithm Speed Run', xp: 200, completed: false },
    { id: 4, title: 'Network Protocol Trivia', xp: 100, completed: false },
    { id: 5, title: 'Math Puzzle Quest', xp: 80, completed: false },
  ]);

  const achievements = [
    { icon: '🏆', name: 'First Quiz', unlocked: xp > 0 },
    { icon: '🔥', name: '7-Day Streak', unlocked: streakDays >= 7 },
    { icon: '📚', name: 'Bookworm', unlocked: xp >= 500 },
    { icon: '💎', name: 'Top 10', unlocked: xp >= 2500 },
    { icon: '🎮', name: 'Gamer', unlocked: gameTasks.every(t => t.completed) },
    { icon: '🧠', name: 'Genius', unlocked: xp >= 5000 },
  ];

  const playTask = (id, reward) => {
    setGameTasks(tasks => tasks.map(t => t.id === id ? { ...t, completed: true } : t));
    setXp(x => x + reward);
    if(streakDays === 0) setStreakDays(1);
  };

  const level = Math.floor(xp / 200) || 0;

  // Dynamic leaderboard computation based on the user's xp vs others
  const leaderboard = [
    { rank: 0, name: 'Alex Chen', pts: Math.max(0, 3200 + Math.floor(Math.random() * 10)), color: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
    { rank: 0, name: 'Maya Patel', pts: Math.max(0, 3100 + Math.floor(Math.random() * 10)), color: 'linear-gradient(135deg, #94a3b8, #64748b)' },
    { rank: 0, name: 'Ryan Kim', pts: Math.max(0, 2800 + Math.floor(Math.random() * 10)), color: 'linear-gradient(135deg, #cd7f32, #b8860b)' },
    { rank: 0, name: 'You', pts: xp, color: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', current: true }
  ];

  leaderboard.sort((a,b) => b.pts - a.pts);
  leaderboard.forEach((user, index) => { user.rank = index + 1; });

  return (
    <>
      <div className="hero-card gamify">
        <div className="hero-card-pattern" />
        <div className="hero-content">
          <div>
            <p className="hero-label">Your Points</p>
            <h1 className="hero-value">{xp} <span className="hero-unit">XP</span></h1>
            <p className="hero-status">Level {level} — Scholar</p>
            <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ width: `${(xp%200)/2}%`, height: '100%', background: 'white', borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 6 }}>{200 - (xp%200)} XP to Level {level + 1}</p>
          </div>
          <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
            {level}
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 20 }}>
        
        {/* Game Tasks */}
        <div className="card full-width">
          <div className="card-header"><h3>Active Mini Games</h3><span className="badge pink">Earn XP</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {gameTasks.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: t.completed ? 'rgba(20, 184, 166, 0.1)' : 'var(--bg)', border: t.completed ? '1px solid var(--teal-500)' : '1px solid var(--border)', borderRadius: '12px' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>+ {t.xp} XP Points</p>
                </div>
                <button 
                  className={`btn btn-sm ${t.completed ? '' : 'btn-primary'}`} 
                  onClick={() => playTask(t.id, t.xp)}
                  disabled={t.completed}
                >
                  {t.completed ? 'Completed' : 'Play Theme'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Achievements</h3><a href="#" style={{ fontSize: '0.82rem', fontWeight: 600 }}>View All</a></div>
          <div className="achievement-grid">
            {achievements.map((a, i) => (
              <div key={i} className={`achievement ${a.unlocked ? '' : 'locked'}`}>
                <span className="ach-icon">{a.icon}</span>
                <p>{a.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Live Leaderboard</h3><span className="badge blue">Dynamic Runtime</span></div>
          {leaderboard.map((l, i) => (
            <div key={i} className={`leaderboard-item ${l.current ? 'current' : ''}`}>
              <span className="lb-rank">{l.rank}</span>
              <div className="avatar" style={{ background: l.color }}>{l.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{l.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.pts.toLocaleString()} XP</p>
              </div>
              <span style={{ fontSize: '1.3rem' }}>{['🥇','🥈','🥉'][i] || '🎗️'}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
