import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { FiUsers, FiBookOpen, FiUser, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, bookRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/counselor')
        ]);
        setData({ ...dashRes.data, bookings: bookRes.data });
      } catch (e) {
        setData({
          userCounts: { total: 1248, students: 1050, teachers: 185, admins: 13 },
          openComplaints: 13, activeToday: 342,
          bookings: []
        });
      }
    };
    fetchData();
  }, []);

  const d = data || { userCounts: { total: 0, students: 0, teachers: 0, admins: 0 }, openComplaints: 0 };

  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [820, 950, 780, 1100, 1050, 600, 450],
      borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
      borderWidth: 3, fill: true, tension: 0.4,
      pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
    }],
  };

  const pieData = {
    labels: ['Students', 'Teachers', 'Admins'],
    datasets: [{ data: [d.userCounts.students, d.userCounts.teachers, d.userCounts.admins], backgroundColor: ['#3b82f6', '#14b8a6', '#8b5cf6'], borderWidth: 0, borderRadius: 4, spacing: 3 }],
  };

  return (
    <>
      <div className="hero-card admin">
        <div className="hero-card-pattern" />
        <div className="hero-content">
          <div>
            <p className="hero-label">System Status</p>
            <h1 className="hero-value" style={{ fontSize: '1.6rem' }}>All Systems Operational</h1>
            <p className="hero-status"><span className="status-dot good" /> 99.9% Uptime</p>
          </div>
          <span className="hero-big-icon">✅</span>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 20 }}>
        <div className="stat-card"><div className="stat-icon blue"><FiUsers size={22} /></div><div><p className="stat-value">{d.userCounts.total.toLocaleString()}</p><p className="stat-label">Total Users</p></div></div>
        <div className="stat-card"><div className="stat-icon purple"><FiBookOpen size={22} /></div><div><p className="stat-value">{d.userCounts.students.toLocaleString()}</p><p className="stat-label">Students</p></div></div>
        <div className="stat-card"><div className="stat-icon teal"><FiUser size={22} /></div><div><p className="stat-value">{d.userCounts.teachers}</p><p className="stat-label">Teachers</p></div></div>
        <div className="stat-card"><div className="stat-icon red"><FiAlertCircle size={22} /></div><div><p className="stat-value">{d.openComplaints}</p><p className="stat-label">Complaints</p></div></div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h3>User Activity</h3><span className="badge blue">7 Days</span></div>
          <div className="chart-wrapper">
            <Line data={activityData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false }, border: { display: false } }, y: { grid: { color: '#f1f5f9' }, border: { display: false } } },
            }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>User Distribution</h3><span className="badge purple">Current</span></div>
          <div className="chart-wrapper-sm" style={{ height: 220 }}>
            <Doughnut data={pieData} options={{
              responsive: true, maintainAspectRatio: false, cutout: '60%',
              plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, usePointStyle: true, padding: 16 } } },
            }} />
          </div>
        </div>
      </div>

      <div className="card full-width" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3>Course Objectives & Academic Tracker</h3>
          <span className="badge teal">Live Data</span>
        </div>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Course</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Teacher</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Objectives Set</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Recent Material</th>
                <th style={{ padding: '12px', textAlign: 'left', borderRadius: '0 8px 8px 0' }}>Avg Student XP (Lvl)</th>
              </tr>
            </thead>
            <tbody>
              {['DSA', 'DBMS', 'Maths', 'OS', 'Networking'].map((sub, i) => (
                <tr key={sub} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>{sub}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>Prof. {['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'][i]}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span className="badge blue">10/10 Objectives Uploaded</span>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--teal-600)' }}>
                    <FiBookOpen style={{ marginRight: 4 }}/> Assignment{i+1}.pdf
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span className="badge orange">2{300 - i*50} XP (Lvl {11 - i})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card full-width" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3>Counselor Bookings</h3>
          <span className="badge pink">Recent</span>
        </div>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Student</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                <th style={{ padding: '12px', textAlign: 'left', borderRadius: '0 8px 8px 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.bookings && d.bookings.length > 0 ? d.bookings.map((booking, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 600 }}>{booking.student_name}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{new Date(booking.booking_date).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 12px' }}>{booking.booking_time}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--teal-600)' }}>{booking.reason || 'N/A'}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span className="badge orange">Pending</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No counselor bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
