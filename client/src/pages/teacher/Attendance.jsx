import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function TeacherAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([
    { init: 'AK', name: 'Alex Kim', status: 'present' },
    { init: 'MP', name: 'Maya Patel', status: 'present' },
    { init: 'RJ', name: 'Raj Johal', status: 'absent' },
    { init: 'SL', name: 'Sara Lee', status: 'present' },
    { init: 'TW', name: 'Tom Wang', status: 'late' },
  ]);

  useEffect(() => {
    // Fetch assigned subjects
    api.get('/teacher/dashboard').then(res => {
      if (res.data.subjects?.length > 0) {
        setSubjects(res.data.subjects);
        setSelectedSubject(res.data.subjects[0]);
      }
    }).catch(console.error);
  }, []);

  const handleStatusChange = (index, status) => {
    const newStudents = [...students];
    newStudents[index].status = status;
    setStudents(newStudents);
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{
      data: [92, 88, 95, 90, 93],
      borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.1)',
      borderWidth: 3, fill: true, tension: 0.4,
      pointBackgroundColor: '#14b8a6', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
    }],
  };

  const statusColors = { present: { bg: '#f0fdf4', color: '#16a34a' }, absent: { bg: '#fef2f2', color: '#dc2626' }, late: { bg: '#fff7ed', color: '#ea580c' } };

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h3>Select Subject</h3>
          <span className="badge blue">My Subjects</span>
        </div>
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 12 }}
        >
          <option value="" disabled>Select a subject...</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><h3>Attendance Overview</h3><span className="badge teal">This Week</span></div>
        <div className="chart-wrapper">
          <Line data={chartData} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, border: { display: false } },
              y: { grid: { color: '#f1f5f9' }, border: { display: false }, min: 70, max: 100 },
            },
          }} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Today — {selectedSubject || 'CS-201'}</h3>
          <button className="btn btn-sm btn-primary" onClick={() => alert('Attendance Saved Successfully for ' + selectedSubject)}>Save Attendance</button>
        </div>
        <div style={{ marginTop: 12 }}>
          {students.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 10, background: 'var(--bg)', marginBottom: 8, flexWrap: 'wrap' }}>
              <div className="avatar" style={{ background: 'var(--gradient-primary)' }}>{s.init}</div>
              <p style={{ flex: 1, fontWeight: 500, fontSize: '0.9rem', minWidth: '100px' }}>{s.name}</p>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => handleStatusChange(i, 'present')}
                  style={{ padding: '6px 12px', borderRadius: 20, border: 'none', background: s.status === 'present' ? statusColors.present.bg : 'var(--border)', color: s.status === 'present' ? statusColors.present.color : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                >
                  Present
                </button>
                <button 
                  onClick={() => handleStatusChange(i, 'absent')}
                  style={{ padding: '6px 12px', borderRadius: 20, border: 'none', background: s.status === 'absent' ? statusColors.absent.bg : 'var(--border)', color: s.status === 'absent' ? statusColors.absent.color : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                >
                  Absent
                </button>
                <button 
                  onClick={() => handleStatusChange(i, 'late')}
                  style={{ padding: '6px 12px', borderRadius: 20, border: 'none', background: s.status === 'late' ? statusColors.late.bg : 'var(--border)', color: s.status === 'late' ? statusColors.late.color : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                >
                  Late
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
