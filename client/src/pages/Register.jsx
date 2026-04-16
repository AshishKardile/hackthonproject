import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { RiGraduationCapLine, RiUserLine, RiShieldLine } from 'react-icons/ri';

export default function Register() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const SUBJECTS = [
    'Data Structures and Algorithms (DSA)', 
    'Mathematics', 
    'Operating Systems (OS)', 
    'Computer Networks', 
    'Database Management Systems (DBMS)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPass) {
      setError('Passwords do not match.');
      return;
    }
    
    if (role === 'teacher' && !teacherSubject) {
      setError('Please select a subject for the teacher account.');
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'teacher') payload.teacher_subjects = teacherSubject;
      
      const user = await register(payload);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'student', label: 'Student', icon: RiGraduationCapLine },
    { key: 'teacher', label: 'Teacher', icon: RiUserLine },
    { key: 'admin', label: 'Admin', icon: RiShieldLine },
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="auth-shape s1" />
        <div className="auth-shape s2" />
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-logo">⚡</span>
          <h1>Create Account</h1>
          <p>Start your wellness journey today</p>
        </div>

        <div className="role-selector">
          {roles.map(r => (
            <button key={r.key} className={`role-btn ${role === r.key ? 'active' : ''}`} onClick={() => setRole(r.key)} type="button">
              <r.icon size={22} />
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <FiMail className="input-icon" />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ padding: '4px', color: 'var(--text-muted)' }}>
              {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input type="password" placeholder="Confirm Password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
          </div>
          
          {role === 'teacher' && (
            <div className="input-group">
              <span className="input-icon">📚</span>
              <select value={teacherSubject} onChange={e => setTeacherSubject(e.target.value)} required style={{ width: '100%', padding: '12px', paddingLeft: '44px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                <option value="" disabled>Select Subject required for Teacher...</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '16px', marginTop: '8px' }}>
            {loading ? 'Creating...' : 'Create Account'}
            <FiArrowRight />
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
