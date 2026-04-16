import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { FiActivity, FiCpu, FiWifi, FiHardDrive } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function AdminSystem() {
  const serverData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
    datasets: [{
      data: [12, 8, 35, 65, 45, 52, 38],
      borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)',
      borderWidth: 3, fill: true, tension: 0.4,
      pointBackgroundColor: '#22c55e', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
    }],
  };

  const complaints = [
    { icon: '❗', title: 'Login Issue', meta: 'User: maya@edu.com · 2h ago', status: 'Open', color: 'red' },
    { icon: '⚠️', title: 'Grade Not Updated', meta: 'User: alex@edu.com · 5h ago', status: 'Pending', color: 'orange' },
    { icon: '✅', title: 'Password Reset', meta: 'User: tom@edu.com · 1d ago', status: 'Resolved', color: 'green' },
  ];

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon green"><FiActivity size={22} /></div><div><p className="stat-value">99.9%</p><p className="stat-label">Uptime</p></div></div>
        <div className="stat-card"><div className="stat-icon blue"><FiCpu size={22} /></div><div><p className="stat-value">4.2GB</p><p className="stat-label">Memory</p></div></div>
        <div className="stat-card"><div className="stat-icon purple"><FiWifi size={22} /></div><div><p className="stat-value">23ms</p><p className="stat-label">Latency</p></div></div>
        <div className="stat-card"><div className="stat-icon orange"><FiHardDrive size={22} /></div><div><p className="stat-value">67%</p><p className="stat-label">Storage</p></div></div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3>Server Load</h3><span className="badge green">Healthy</span></div>
        <div className="chart-wrapper">
          <Line data={serverData} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, border: { display: false } },
              y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { callback: v => v + '%' } },
            },
          }} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3>Recent Complaints</h3><span className="badge red">5 Open</span></div>
        {complaints.map((c, i) => (
          <div key={i} className="list-item">
            <div className="avatar" style={{ background: c.color === 'red' ? '#ef4444' : c.color === 'orange' ? '#f97316' : '#22c55e', fontSize: '1rem' }}>{c.icon}</div>
            <div className="list-item-info"><p>{c.title}</p><p>{c.meta}</p></div>
            <span className={`badge ${c.color}`}>{c.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
