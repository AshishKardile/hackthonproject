import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiMenu } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const titles = {
  '/student': 'Dashboard',
  '/student/wellness': 'Wellness Center',
  '/student/academic': 'Academic Tools',
  '/student/gamification': 'Gamification',
  '/student/profile': 'Profile',
  '/teacher': 'Dashboard',
  '/teacher/attendance': 'Attendance',
  '/teacher/assignments': 'Assignments',
  '/teacher/reports': 'Reports',
  '/teacher/profile': 'Profile',
  '/admin': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/system': 'System Monitor',
  '/admin/announcements': 'Announcements',
  '/admin/profile': 'Profile',
};

export default function TopHeader({ onMenuToggle }) {
  const { user } = useAuth();
  const location = useLocation();
  const title = titles[location.pathname] || 'Dashboard';
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [location]);

  const fetchNotifications = async () => {
    try {
      const dbData = await api.get('/notifications');
      setNotifications(dbData.data);
    } catch(e) {
      // failed to fetch notifications
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch(e) {}
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <FiMenu />
        </button>
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </p>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="header-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="icon-btn" onClick={() => {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        }}>
          {document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="icon-btn" onClick={() => setShowDropdown(!showDropdown)}>
          <FiBell size={20} />
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>
        
        {showDropdown && (
          <div style={{ position: 'absolute', top: '50px', right: '0', background: 'white', width: '300px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', borderRadius: '12px', zIndex: 100, border: '1px solid var(--border)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Notifications</div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {notifications.length === 0 ? <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications</div> : notifications.map(n => (
                <div key={n.id} onClick={() => markAsRead(n.id)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: n.is_read ? 'white' : 'var(--blue-50)', cursor: 'pointer' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: n.is_read ? 500 : 700 }}>{n.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
