import { useState, useEffect } from 'react';
import { FiBookOpen, FiCheckSquare, FiAward, FiDownload, FiUploadCloud } from 'react-icons/fi';
import api from '../../services/api';

const SUBJECTS = [
  'Data Structures and Algorithms (DSA)', 
  'Mathematics', 
  'Operating Systems (OS)', 
  'Computer Networks', 
  'Database Management Systems (DBMS)'
];

export default function StudentAcademic() {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [objectives, setObjectives] = useState([]);
  const [activeMaterials, setActiveMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    handleSubjectSelect(SUBJECTS[0]);
  }, []);

  const handleSubjectSelect = async (sub) => {
    setSelectedSubject(sub);
    setLoading(true);
    
    // Fetch objectives from database
    try {
      const resObj = await api.get(`/objectives/${encodeURIComponent(sub)}`);
      setObjectives(resObj.data);
    } catch (e) {
      setObjectives([]);
    }

    // Fetch assignments from database
    try {
      const res = await api.get(`/assignments?subject=${sub}`);
      setActiveMaterials(res.data); // Make sure studentController returns start_date
    } catch (e) {
      setActiveMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    try {
      await api.post('/assignments/submit', {
        assignment_id: assignmentId,
        file_url: 'student_submitted_file.pdf'
      });
      showMessage('Task submitted successfully! Teacher has been notified.');
      handleSubjectSelect(selectedSubject); // Refresh list
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error submitting task.');
    }
  };

  return (
    <>
      <div className="card full-width">
        <div className="card-header">
          <h3>My Enrolled Subjects</h3>
          <span className="badge blue">Select to view</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 12 }}>
          {SUBJECTS.map(sub => (
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

      {message && (
        <div style={{ marginTop: 20, padding: '16px 20px', background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#dc2626' : '#16a34a', border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`, borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
          {message.includes('Error') ? '⚠️' : '✅'}
          {message}
        </div>
      )}

      <div className="dashboard-grid" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3>{selectedSubject} Objectives</h3>
            <span className="badge purple"><FiBookOpen /></span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 12, maxHeight: '380px', overflowY: 'auto' }}>
            {objectives.map((obj, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text)' }}>{obj}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Assignments, Quizzes & Tests</h3>
            <span className="badge orange">Action Required</span>
          </div>
          
          <div style={{ marginTop: 16 }}>
            {loading ? <p>Loading...</p> : activeMaterials.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No active tasks for this subject.</p> : activeMaterials.map((mat, i) => {
              const isExpired = new Date() > new Date(mat.due_date);
              const typeLabel = mat.type ? mat.type.toUpperCase() : 'TASK';
              return (
                <div key={i} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="badge purple" style={{ fontSize: '0.65rem' }}>{typeLabel}</span>
                      <p style={{ fontWeight: 600 }}>{mat.title}</p>
                    </div>
                    {mat.submission ? <span className="badge green">Submitted</span> : isExpired ? <span className="badge red">Expired</span> : null}
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', gap: 16 }}>
                    {mat.start_date && <span><strong>Starts:</strong> {new Date(mat.start_date).toLocaleString()}</span>}
                    <span><strong>Deadline:</strong> {new Date(mat.due_date).toLocaleString()}</span>
                  </div>

                  {mat.submission ? (
                    <button className="btn btn-outline" style={{ width: '100%' }} disabled>
                      <FiAward style={{ marginRight: 8 }}/> Completed
                    </button>
                  ) : isExpired ? (
                    <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--red-300)', color: 'var(--red-500)' }} disabled>
                      Deadline Passed
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {mat.file_url && mat.file_url !== 'mock_uploaded_file.pdf' ? (
                        <a href={`http://localhost:5000/uploads/${mat.file_url}`} target="_blank" download className="btn btn-outline" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <FiDownload /> Document
                        </a>
                      ) : (
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => showMessage('No document attached.')}>
                          <FiDownload /> DL
                        </button>
                      )}
                      <button 
                        className={`btn btn-primary`} 
                        style={{ flex: 2 }}
                        onClick={() => handleSubmitAssignment(mat.id)}
                      >
                        <FiUploadCloud style={{ marginRight: 8 }}/> Submit Work
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
