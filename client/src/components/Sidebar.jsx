import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiHeart, FiBookOpen, FiAward, FiUser, FiUsers, FiClipboard, FiBarChart2, FiGrid, FiMonitor, FiBell, FiLogOut, FiCheckSquare, FiHelpCircle } from 'react-icons/fi';
const navConfig = {
  student: [
    { section: 'Main' },
    { label: 'Dashboard', icon: FiHome, to: '/student' },
    { label: 'Wellness', icon: FiHeart, to: '/student/wellness' },
    { label: 'Academic', icon: FiBookOpen, to: '/student/academic' },
    { label: 'Gamification', icon: FiAward, to: '/student/gamification' },
    { label: 'View Results', icon: FiAward, to: '/student/results' },
    { section: 'Account' },
    { label: 'Profile', icon: FiUser, to: '/student/profile' },
    { label: 'Help Support', icon: FiHelpCircle, to: '/student/help' },
  ],
  teacher: [
    { section: 'Main' },
    { label: 'Dashboard', icon: FiHome, to: '/teacher' },
    { label: 'Attendance', icon: FiCheckSquare, to: '/teacher/attendance' },
    { label: 'Assignments', icon: FiClipboard, to: '/teacher/assignments' },
    { label: 'Give Marks', icon: FiAward, to: '/teacher/marks' },
    { label: 'Reports', icon: FiBarChart2, to: '/teacher/reports' },
    { section: 'Account' },
    { label: 'Profile', icon: FiUser, to: '/teacher/profile' },
    { label: 'Help Support', icon: FiHelpCircle, to: '/teacher/help' },
  ],
  admin: [
    { section: 'Main' },
    { label: 'Dashboard', icon: FiHome, to: '/admin' },
    { label: 'Users', icon: FiUsers, to: '/admin/users' },
    { label: 'System', icon: FiMonitor, to: '/admin/system' },
    { label: 'View Results', icon: FiAward, to: '/admin/results' },
    { label: 'Announcements', icon: FiBell, to: '/admin/announcements' },
    { section: 'Account' },
    { label: 'Profile', icon: FiUser, to: '/admin/profile' },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const gradientClass = user?.role === 'teacher' ? 'linear-gradient(135deg, #0d9488, #3b82f6)'
    : user?.role === 'admin' ? 'linear-gradient(135deg, #1e293b, #7c3aed)'
    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo">⚡</span>
        <div className="sidebar-brand">
          <h2>EduWell AI</h2>
          <p>Wellness & Academics</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item, i) =>
          item.section ? (
            <div className="sidebar-section" key={i}>{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/${user?.role}`}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon className="nav-icon" />
              {item.label}
            </NavLink>
          )
        )}

        <div style={{ flex: 1 }} />

        <button className="nav-link" onClick={handleLogout} style={{ color: '#ef4444' }}>
          <FiLogOut className="nav-icon" style={{ color: '#ef4444' }} />
          Log Out
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: gradientClass }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="sidebar-user-info">
            <p>{user?.name}</p>
            <p>{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
