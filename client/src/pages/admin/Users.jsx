import { useState } from 'react';

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Students', 'Teachers', 'Admins'];

  const users = [
    { init: 'SJ', name: 'Sarah Johnson', meta: 'Student · CS-201', status: 'Active', statusColor: 'blue', bg: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
    { init: 'RS', name: 'Dr. Robert Smith', meta: 'Teacher · Computer Science', status: 'Active', statusColor: 'green', bg: 'linear-gradient(135deg,#14b8a6,#0d9488)' },
    { init: 'AK', name: 'Alex Kim', meta: 'Student · CS-201', status: 'Active', statusColor: 'blue', bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
    { init: 'MP', name: 'Maya Patel', meta: 'Student · EE-101', status: 'Inactive', statusColor: 'gray', bg: 'linear-gradient(135deg,#ec4899,#db2777)' },
    { init: 'JD', name: 'Jane Doe', meta: 'Teacher · Mathematics', status: 'Active', statusColor: 'green', bg: 'linear-gradient(135deg,#f97316,#ea580c)' },
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--white)', padding: '12px 16px', borderRadius: 14, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>🔍</span>
        <input type="text" placeholder="Search users..." style={{ flex: 1, fontSize: '0.92rem', background: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 18px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap',
            background: activeTab === t ? 'var(--blue-600)' : 'var(--white)',
            color: activeTab === t ? 'white' : 'var(--text-secondary)',
            boxShadow: activeTab === t ? 'var(--shadow-blue)' : 'none',
          }}>{t}</button>
        ))}
      </div>

      <div className="card">
        {users.map((u, i) => (
          <div key={i} className="list-item">
            <div className="avatar" style={{ background: u.bg }}>{u.init}</div>
            <div className="list-item-info"><p>{u.name}</p><p>{u.meta}</p></div>
            <span className={`badge ${u.statusColor}`}>{u.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
