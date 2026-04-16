import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <div className="hero-card admin" style={{ textAlign: 'center', padding: '36px 24px' }}>
        <div className="hero-card-pattern" />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 auto 12px' }}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <h2 style={{ color: 'white', fontSize: '1.3rem' }}>{user?.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 4 }}>Super Administrator</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div><strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800 }}>1,248</strong><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Users</span></div>
            <div><strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800 }}>99.9%</strong><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Uptime</span></div>
            <div><strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800 }}>13</strong><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Tickets</span></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
        {['👤 Edit Profile', '🔐 Security', '💾 Backup & Restore', '❓ Help'].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
            <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>{l}</span>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </div>
        ))}
        <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', color: '#ef4444' }}>
          <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>🚪 Log Out</span>
          <span>›</span>
        </div>
      </div>
    </>
  );
}
