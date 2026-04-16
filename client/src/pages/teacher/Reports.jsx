import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function TeacherReports() {
  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [{ data: [35, 28, 20, 12, 5], backgroundColor: ['#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#ef4444'], borderWidth: 0, borderRadius: 4, spacing: 3 }],
  };

  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      { label: 'CS-201', data: [75, 78, 82, 85], borderColor: '#3b82f6', borderWidth: 2.5, tension: 0.4, pointRadius: 4 },
      { label: 'CS-301', data: [80, 82, 79, 86], borderColor: '#8b5cf6', borderWidth: 2.5, tension: 0.4, pointRadius: 4 },
    ],
  };

  const atRisk = [
    { init: 'RJ', name: 'Raj Johal', meta: 'GPA: 2.1 · Attendance: 68%', color: '#ef4444' },
    { init: 'KL', name: 'Kelly Liu', meta: 'GPA: 2.3 · Attendance: 72%', color: '#f97316' },
    { init: 'DM', name: 'David Miller', meta: 'GPA: 2.4 · Attendance: 75%', color: '#f97316' },
  ];

  return (
    <div className="dashboard-grid">
      <div className="card">
        <div className="card-header"><h3>Grade Distribution</h3><span className="badge teal">CS-201</span></div>
        <div className="chart-wrapper-sm" style={{ height: 220 }}>
          <Doughnut data={gradeData} options={{
            responsive: true, maintainAspectRatio: false, cutout: '65%',
            plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, usePointStyle: true, padding: 16 } } },
          }} />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Performance Trend</h3><span className="badge blue">Semester</span></div>
        <div className="chart-wrapper">
          <Line data={trendData} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { font: { family: 'Inter', size: 11 }, usePointStyle: true, padding: 16 } } },
            scales: { x: { grid: { display: false }, border: { display: false } }, y: { grid: { color: '#f1f5f9' }, border: { display: false } } },
          }} />
        </div>
      </div>

      <div className="card full-width">
        <div className="card-header"><h3>At-Risk Students</h3><span className="badge red">3 Students</span></div>
        {atRisk.map((s, i) => (
          <div key={i} className="list-item">
            <div className="avatar" style={{ background: s.color }}>{s.init}</div>
            <div className="list-item-info"><p>{s.name}</p><p>{s.meta}</p></div>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          </div>
        ))}
      </div>
    </div>
  );
}
