import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function StudentWellness() {
  const [mood, setMood] = useState('Okay');
  const [stress, setStress] = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Start');
  const [history, setHistory] = useState([]);
  
  const [testAnswers, setTestAnswers] = useState(new Array(10).fill(false));

  const questions = [
    "I have been feeling cheerful and in good spirits.",
    "I have felt calm and relaxed today.",
    "I have felt active and vigorous.",
    "I woke up feeling fresh and rested.",
    "My daily life has been filled with things that interest me.",
    "I feel connected to friends and family.",
    "I am able to concentrate on my studies.",
    "I am not easily overwhelmed by my workload.",
    "I take regular breaks and step away from screens.",
    "I am feeling confident about my goals."
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/wellness/history');
      setHistory(res.data);
    } catch (err) {
      console.log('Failed to fetch wellness history');
    }
  };

  const moods = [
    { key: 'Great', emoji: '😄', label: 'Great' },
    { key: 'Good', emoji: '🙂', label: 'Good' },
    { key: 'Okay', emoji: '😐', label: 'Okay' },
    { key: 'Low', emoji: '😔', label: 'Low' },
    { key: 'Bad', emoji: '😢', label: 'Bad' },
  ];

  const submitWellnessTest = async () => {
    try {
      await api.post('/wellness/test', { 
        mood, 
        stress_level: stress, 
        answers: testAnswers 
      });
      alert('Wellness Test submitted successfully!');
      fetchHistory();
    } catch (e) {
      alert('Error submitting wellness test');
    }
  };

  const startBreathing = () => {
    if (breathActive) {
      setBreathActive(false);
      setBreathPhase('Start');
      return;
    }
    setBreathActive(true);
    const phases = ['Inhale', 'Hold', 'Exhale'];
    let i = 0;
    const interval = setInterval(() => {
      setBreathPhase(phases[i % 3]);
      i++;
    }, 4000);
    setBreathPhase('Inhale');
    setTimeout(() => { clearInterval(interval); setBreathActive(false); setBreathPhase('Start'); }, 60000);
  };

  // Build dynamic mood chart from history. Fallback array if none.
  const chartLabels = history.length > 0 ? history.map(() => 'Day').reverse() : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartDataScores = history.length > 0 ? history.map(h => h.score || 0).reverse() : [0, 0, 0, 0, 0, 0, 0];

  const moodChart = {
    labels: chartLabels.slice(-7), // last 7 days
    datasets: [{
      data: chartDataScores.slice(-7),
      backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#8b5cf6', '#14b8a6'].map(c => c + 'cc'),
      borderRadius: 8, barPercentage: 0.6,
    }],
  };

  const [wellnessTasks, setWellnessTasks] = useState([
    { id: 1, emoji: '📖', title: 'Read a Book for 15 mins', completed: false, addedPoints: false },
    { id: 2, emoji: '🚶‍♂️', title: 'Go for a Short Walk', completed: false, addedPoints: false },
    { id: 3, emoji: '🏋️', title: 'Do a Quick Exercise', completed: false, addedPoints: false },
    { id: 4, emoji: '🧘', title: '5 mins Meditation Break', completed: false, addedPoints: false },
    { id: 5, emoji: '💧', title: 'Drink 8 Glasses of Water', completed: false, addedPoints: false },
    { id: 6, emoji: '🍏', title: 'Eat a Healthy Meal', completed: false, addedPoints: false },
    { id: 7, emoji: '🛌', title: 'Sleep 8 Hours', completed: false, addedPoints: false },
    { id: 8, emoji: '📓', title: 'Write in a Journal', completed: false, addedPoints: false },
    { id: 9, emoji: '☀️', title: 'Get 15 mins of Sunlight', completed: false, addedPoints: false }
  ]);

  const toggleWellnessTask = (id) => {
    setWellnessTasks(tasks =>
      tasks.map(t => (t.id === id && !t.addedPoints) ? { ...t, completed: !t.completed } : t)
    );
  };

  const submitTasks = async () => {
    const newlyCompleted = wellnessTasks.filter(t => t.completed && !t.addedPoints);
    if (newlyCompleted.length === 0) {
      alert('Select some new tasks to submit first.');
      return;
    }
    try {
      await api.post('/wellness/tasks', { points: newlyCompleted.length * 10 });
      setWellnessTasks(tasks => 
        tasks.map(t => (!t.addedPoints && t.completed) ? { ...t, addedPoints: true } : t)
      );
      alert(`Tasks submitted! You earned ${newlyCompleted.length * 10} Gamification points.`);
    } catch(err) {
      alert('Failed to submit tasks');
    }
  };

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>Wellness Assessment Test</h2>
      <div className="card" style={{ marginBottom: 24, padding: 30 }}>
        {/* Mood Selector */}
        <h3 style={{ textAlign: 'center', marginBottom: 20 }}>1. How do you feel today?</h3>
        <div className="mood-selector" style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 40 }}>
          {moods.map(m => (
            <button key={m.key} className={`mood-btn ${mood === m.key ? 'selected' : ''}`} onClick={() => setMood(m.key)} style={{ padding: '15px 25px', borderRadius: 12, border: mood === m.key ? '2px solid var(--primary)' : '1px solid var(--border)', background: mood === m.key ? 'rgba(59,130,246,0.1)' : 'var(--bg)', cursor: 'pointer' }}>
              <span style={{ fontSize: 32 }}>{m.emoji}</span>
              <div style={{ marginTop: 8, fontWeight: 600 }}>{m.label}</div>
            </button>
          ))}
        </div>

        {/* Stress Check */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ textAlign: 'center', marginBottom: 20 }}>2. How stressed are you feeling? (0-10)</h3>
          <input 
            type="range" 
            min="0" max="10" 
            value={stress} 
            onChange={(e) => setStress(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>0 = Completely Relaxed</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Level: {stress}</span>
            <span>10 = Extremely Stressed</span>
          </div>
        </div>

        {/* Questions */}
        <h3 style={{ marginBottom: 20 }}>3. Answer these quick check-in questions:</h3>
        <div style={{ display: 'grid', gap: 12, marginBottom: 30 }}>
          {questions.map((q, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={testAnswers[i]} onChange={() => {
                const newA = [...testAnswers];
                newA[i] = !newA[i];
                setTestAnswers(newA);
              }} style={{ width: 18, height: 18 }} />
              <span>{q}</span>
            </label>
          ))}
        </div>

        <button className="btn btn-primary" onClick={submitWellnessTest} style={{ width: '100%', padding: 16, fontSize: '1.1rem' }}>
          Submit Wellness Test
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Breathing Exercise */}
        <div className="card">
          <div className="card-header"><h3>Breathing Exercise</h3></div>
          <div className="breathing-container">
            <div className={`breath-circle ${breathActive ? (breathPhase === 'Inhale' ? 'inhale' : '') : ''}`}>
              <span className="breath-text">{breathPhase}</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={startBreathing}>
              {breathActive ? '⏹ Stop' : '▶ Begin Exercise'}
            </button>
          </div>
        </div>

        {/* Counselor Booking (Moved here) */}
        <div className="card">
          <div className="card-header"><h3>Book Counselor</h3><span className="badge teal">Support</span></div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
              await api.post('/counselor/book', {
                booking_date: formData.get('date'),
                booking_time: formData.get('time'),
                reason: formData.get('reason')
              });
              alert('Counselor booked successfully!');
              e.target.reset();
            } catch (err) {
              alert('Error booking counselor');
            }
          }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Date</label>
                <input type="date" name="date" required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Time</label>
                <input type="time" name="time" required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Reason</label>
              <input type="text" name="reason" placeholder="Briefly describe your concern..." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Book Session</button>
          </form>
        </div>

        {/* Wellness Tasks */}
        <div className="card full-width">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 style={{ margin: 0 }}>Daily Wellness Tasks</h3>
              <span className="badge pink">{wellnessTasks.filter(t => t.completed).length}/{wellnessTasks.length} Completed</span>
            </div>
            <button className="btn btn-sm btn-primary" onClick={submitTasks}>Submit Completed Tasks</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginTop: '12px' }}>
            {wellnessTasks.map((t) => (
              <div 
                key={t.id} 
                onClick={() => toggleWellnessTask(t.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                  background: t.completed ? 'rgba(20, 184, 166, 0.1)' : 'var(--bg)', 
                  border: t.completed ? '1px solid var(--teal-500)' : '1px solid var(--border)',
                  borderRadius: '12px', cursor: t.addedPoints ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
                  opacity: t.addedPoints ? 0.6 : 1
                }}
              >
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', border: t.completed ? 'none' : '2px solid var(--border)', 
                  background: t.completed ? 'var(--teal-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' 
                }}>
                  {t.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: t.completed ? 'var(--teal-600)' : 'var(--text)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                    {t.emoji} {t.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Chart */}
        <div className="card full-width">
          <div className="card-header"><h3>Wellness Score History</h3><span className="badge purple">Tracking</span></div>
          <div className="chart-wrapper">
            <Bar data={moodChart} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, border: { display: false } },
                y: { grid: { color: '#f1f5f9' }, border: { display: false }, min: 0, max: 100 },
              },
            }} />
          </div>
        </div>
      </div>
    </>
  );
}
