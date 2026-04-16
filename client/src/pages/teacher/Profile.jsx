import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function TeacherProfile() {
  const { user, logout, updateLocalUser } = useAuth(); // Assuming there's a way to trigger UI rebuild or just update the user object
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || ''
  });
  const [message, setMessage] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/teacher/profile', formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      // Optional: If AuthContext hasn't refreshed the UI natively, we might need a fetch or update.
      // Assuming reload or context update handles the rest
    } catch (err) {
      setMessage('Failed to update profile.');
    }
  };

  return (
    <>
      <div className="hero-card teacher" style={{ textAlign: 'center', padding: '36px 24px' }}>
        <div className="hero-card-pattern" />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 auto 12px' }}>
            {user?.name?.charAt(0) || 'T'}
          </div>
          <h2 style={{ color: 'white', fontSize: '1.3rem' }}>{formData.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: 4 }}>{formData.department} · Senior Professor</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div><strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800 }}>156</strong><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Students</span></div>
            <div><strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800 }}>4</strong><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Courses</span></div>
            <div><strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800 }}>4.8</strong><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Rating</span></div>
          </div>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: 20, padding: '16px 20px', background: message.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: message.includes('Failed') ? '#dc2626' : '#16a34a', border: `1px solid ${message.includes('Failed') ? '#fecaca' : '#bbf7d0'}`, borderRadius: '12px', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {isEditing ? (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Edit Personal Details</h3>
          <form style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSave}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Full Name</label>
              <input type="text" className="input-group" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} style={{ width: '100%' }} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email Address</label>
              <input type="email" className="input-group" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} style={{ width: '100%' }} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Department / Main Subject</label>
              <input type="text" className="input-group" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
          <div onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
            <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>👤 Edit Profile / Login Info</span>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
            <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>🔔 Notifications</span>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
            <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>❓ Help & Support</span>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </div>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', color: '#ef4444' }}>
            <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 500 }}>🚪 Log Out</span>
            <span>›</span>
          </div>
        </div>
      )}
    </>
  );
}
