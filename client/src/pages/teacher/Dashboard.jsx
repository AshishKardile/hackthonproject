import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { FiUsers, FiClipboard, FiCheckSquare, FiAward, FiUpload, FiBookOpen } from 'react-icons/fi';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// We will dynamically render buttons based on assigned subjects (data?.subjects) instead of hardcoding.
const ALL_SUBJECTS = [
  'Data Structures and Algorithms (DSA)', 
  'Mathematics', 
  'Operating Systems (OS)', 
  'Computer Networks', 
  'Database Management Systems (DBMS)'
];

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [uploadType, setUploadType] = useState('assignment');
  const [message, setMessage] = useState(''); // Replaces native alerts

  // Helper to show message then clear it
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const dbData = await api.get('/teacher/dashboard');
      const assignmentsResponse = await api.get('/teacher/assignments'); 
      const parsedData = { ...dbData.data, assignments: assignmentsResponse?.data?.assignments || [] };
      setData(parsedData);
      
      // Auto-select the first assigned subject
      if (parsedData.subjects && parsedData.subjects.length > 0) {
        handleSubjectSelect(parsedData.subjects[0], parsedData);
      }
    } catch (e) {
      setData({ assignments: [], subjects: [] });
    }
  };

  const handleSubjectSelect = async (sub, providedData = data) => {
    const assignedSubjects = providedData?.subjects || [];
    if (!assignedSubjects.includes(sub)) {
      showMessage(`Access Denied: You are not assigned to teach ${sub}. Subject privacy enforced.`);
      return;
    }

    setSelectedSubject(sub);
    try {
      const resObj = await api.get(`/objectives/${encodeURIComponent(sub)}`);
      setObjectives(resObj.data);
    } catch (e) {
      setObjectives(['Failed to load objectives for this subject.']);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const type = formData.get('type') || uploadType;
    const start_datetime = formData.get('start_datetime');
    const end_datetime = formData.get('end_datetime');

    try {
      await api.post('/assignments', {
        title: title,
        type: type,
        subject: selectedSubject,
        start_datetime: start_datetime, // we'll assume the backend accepts it
        due_date: end_datetime, // mapping end_datetime to due_date in backend
        file_url: 'mock_uploaded_file.pdf'
      });
      showMessage(`${type.toUpperCase()} '${title}' uploaded successfully! Students enrolled in ${selectedSubject} have been notified.`);
      e.target.reset();
      fetchAssignments();
    } catch (err) {
      showMessage('Error uploading task. Please try again.');
    }
  };

  const d = data || { assignments: [], subjects: [] };

  return (
    <>
      <div className="hero-card teacher">
        <div className="hero-card-pattern" />
        <div className="hero-content">
          <div>
            <p className="hero-label">Welcome, Teacher</p>
            <h1 className="hero-value">Your Assigned Subjects</h1>
            <p className="hero-status">Manage your courses & upload tasks</p>
          </div>
          <span className="hero-big-icon">📚</span>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: 20, padding: '16px 20px', background: message.includes('Error') || message.includes('Denied') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') || message.includes('Denied') ? '#dc2626' : '#16a34a', border: `1px solid ${message.includes('Error') || message.includes('Denied') ? '#fecaca' : '#bbf7d0'}`, borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
          {message.includes('Error') || message.includes('Denied') ? '⚠️' : '✅'}
          {message}
        </div>
      )}

      <div className="dashboard-grid" style={{ marginTop: 20 }}>
        {/* Subject Selection */}
        <div className="card full-width">
          <div className="card-header">
            <h3>My Assigned Subjects</h3>
            <span className="badge blue">Select to view</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 12 }}>
            {d.subjects.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No subjects assigned.</p> : d.subjects.map(sub => (
              <button 
                key={sub} 
                className={`btn ${selectedSubject === sub ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleSubjectSelect(sub)}
                style={{ flex: 1, minWidth: '120px' }}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {selectedSubject && (
          <>
            {/* Upload Section */}
            <div className="card">
              <div className="card-header">
                <h3>Upload Task for {selectedSubject}</h3>
                <span className="badge purple"><FiUpload /></span>
              </div>
              <form onSubmit={handleFileUpload} style={{ marginTop: 12 }}>
                <div className="input-group" style={{ marginBottom: 12 }}>
                  <select 
                    name="type"
                    value={uploadType} 
                    onChange={e => setUploadType(e.target.value)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="test">Test</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 12 }}>
                  <input type="text" name="title" placeholder="Task Title (e.g. End Term Quiz)" required />
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Start Date & Time</label>
                    <input type="datetime-local" name="start_datetime" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>End Date & Time (Deadline)</label>
                    <input type="datetime-local" name="end_datetime" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                </div>
                
                <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: 16 }}>
                  <input type="file" id="file-upload" name="task_file" style={{ display: 'none' }} required />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FiUpload size={24} color="var(--blue-500)" />
                    <span style={{ fontWeight: 500, color: 'var(--blue-600)' }}>Click to upload files</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PDF, DOCX, or ZIP (Max 10MB)</span>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Upload & Notify Students</button>
              </form>
            </div>

            {/* Course Objectives */}
            <div className="card">
              <div className="card-header">
                <h3>{selectedSubject} Objectives</h3>
                <span className="badge teal"><FiBookOpen /></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 12, maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {objectives.map((obj, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--teal-100)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text)' }}>
                      {obj}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="card full-width">
          <div className="card-header"><h3>Active Assignments</h3><a href="#" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Refresh</a></div>
          {d.assignments.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No assignments uploaded yet.</p> : d.assignments.map((s, i) => (
            <div key={i} className="list-item">
              <div className="avatar" style={{ background: ['linear-gradient(135deg,#3b82f6,#2563eb)', 'linear-gradient(135deg,#ec4899,#db2777)', 'linear-gradient(135deg,#14b8a6,#0d9488)'][i % 3] }}>
                {s.subject.substring(0,2).toUpperCase()}
              </div>
              <div className="list-item-info">
                <p>{s.title}</p>
                <p>Due: {new Date(s.due_date).toLocaleDateString()}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subject: {s.subject}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
