import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function StudentProfile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    year_level: user?.year_level || '',
    password: ''
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // don't send empty password
      const res = await api.put('/auth/profile', payload);
      updateUser(res.data.user);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return (
    <>
      <div className="hero-card student" style={{ textAlign: 'center', padding: '36px 24px' }}>
        <div className="hero-card-pattern" />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 auto 12px' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <h2 style={{ color: 'white', fontSize: '1.3rem' }}>{user?.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 4 }}>
            {user?.department || 'General'} · {user?.year_level || 'Student'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: 4 }}>{user?.email}</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Profile Information</h3>
            <button className="btn btn-sm btn-outline" onClick={() => { setIsEditing(!isEditing); }}>
              {isEditing ? 'Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Full Name</label>
                <div className="input-group">
                  <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email Address</label>
                <div className="input-group">
                  <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Department / Major</label>
                <div className="input-group">
                  <input type="text" placeholder="e.g. Computer Science" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Year Level</label>
                <div className="input-group">
                  <input type="text" placeholder="e.g. 2nd Year" value={formData.year_level} onChange={e => setFormData({...formData, year_level: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>New Password <span style={{ color: 'var(--text-muted)' }}>(leave blank to keep current)</span></label>
                <div className="input-group">
                  <input type="password" placeholder="New Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : '✓ Save Changes'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '-' },
                { label: 'Department', value: user?.department || 'Not Provided' },
                { label: 'Year Level', value: user?.year_level || 'Not Provided' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.label}</p>
                  <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Settings</h3>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>Notifications</span>
              <span style={{ color: 'var(--text-muted)' }}>›</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={handleThemeToggle}>
              <span style={{ fontSize: '1.2rem' }}>🌙</span>
              <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>Toggle Dark Mode</span>
              <span style={{ color: 'var(--text-muted)' }}>›</span>
            </div>
            <div onClick={() => navigate('/student/help')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>❓</span>
              <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>Help & Support</span>
              <span style={{ color: 'var(--text-muted)' }}>›</span>
            </div>
            <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', cursor: 'pointer', color: '#ef4444' }}>
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
              <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 600 }}>Log Out</span>
              <span>›</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
