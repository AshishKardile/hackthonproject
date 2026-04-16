import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiUploadCloud, FiFileText } from 'react-icons/fi';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [uploadType, setUploadType] = useState('assignment');
  const [message, setMessage] = useState('');

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const dbData = await api.get('/teacher/dashboard');
      const assignmentsResponse = await api.get('/teacher/assignments'); 
      setAssignments(assignmentsResponse?.data?.assignments || []);
      setSubjects(dbData.data.subjects || []);
      if (dbData.data.subjects?.length > 0) {
        setSelectedSubject(dbData.data.subjects[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('subject', selectedSubject);

    try {
      await api.post('/teacher/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const title = formData.get('title');
      const type = formData.get('type') || uploadType;
      showMessage(`${type.toUpperCase()} '${title}' uploaded from device successfully!`);
      e.target.reset();
      fetchData();
    } catch (err) {
      showMessage('Error uploading task. Please try again.');
    }
  };

  return (
    <>
      <div className="card full-width" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>My Assigned Subjects</h3>
          <span className="badge blue">Select scope for uploads</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 12 }}>
          {subjects.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No subjects assigned.</p> : subjects.map(sub => (
            <button 
              key={sub} 
              className={`btn ${selectedSubject === sub ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedSubject(sub)}
              style={{ flex: 1, minWidth: '120px' }}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div style={{ padding: '16px 20px', marginBottom: 20, background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#dc2626' : '#16a34a', border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`, borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
          {message}
        </div>
      )}

      {selectedSubject && (
        <div className="dashboard-grid">
          {/* File Upload Section */}
          <div className="card full-width" style={{ borderTop: '4px solid var(--purple-500)' }}>
            <div className="card-header">
              <h3><FiUploadCloud /> Upload Task from Device</h3>
              <span className="badge purple">For: {selectedSubject}</span>
            </div>
            
            <form onSubmit={handleFileUpload} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className={`btn ${uploadType === 'quiz' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setUploadType('quiz')} style={{ flex: 1, borderRadius: '8px' }}>Quiz</button>
                <button type="button" className={`btn ${uploadType === 'assignment' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setUploadType('assignment')} style={{ flex: 1, borderRadius: '8px' }}>Assignment</button>
                <button type="button" className={`btn ${uploadType === 'test' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setUploadType('test')} style={{ flex: 1, borderRadius: '8px' }}>Test</button>
              </div>
              <input type="hidden" name="type" value={uploadType} />

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Task Title</label>
                <input type="text" name="title" className="input-group" placeholder="e.g. Unit 3 Programming Test" required style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Start Date & Time</label>
                  <input type="datetime-local" name="start_datetime" className="input-group" required style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>End Date & Time (Deadline)</label>
                  <input type="datetime-local" name="due_date" className="input-group" required style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Attach File</label>
                <div style={{ position: 'relative', overflow: 'hidden', padding: '16px', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-light)' }}>
                  <FiFileText style={{ fontSize: '24px', color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontWeight: 500 }}>Click to browse device or drag file here</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Accepts: .txt, .doc, .docx, .ppt, .pptx, .pdf</p>
                  <input type="file" name="task_file" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }} accept=".txt,.doc,.docx,.ppt,.pptx,application/pdf" required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', marginTop: 8 }}>
                Publish {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Uploaded Assignments List */}
      {selectedSubject && assignments.filter(a => a.subject === selectedSubject).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16, color: 'var(--text)' }}>Active Deployments for {selectedSubject}</h3>
          <div className="dashboard-grid">
            {assignments.filter(a => a.subject === selectedSubject).map((a, i) => (
              <div key={i} className="card" style={{ borderLeft: `5px solid var(--purple-500)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text)' }}>{a.title}</h4>
                    <span className="badge blue" style={{ marginBottom: 12, display: 'inline-block' }}>{a.type.toUpperCase()}</span>
                    {a.file_url && a.file_url !== 'mock_uploaded_file.pdf' && (
                       <div style={{ margin: '8px 0' }}>
                         <a href={`http://localhost:5000/uploads/${a.file_url}`} target="_blank" download className="badge purple" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                           📄 View Uploaded Document
                         </a>
                       </div>
                    )}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0' }}>Start: {new Date(a.start_date).toLocaleString()}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>End: {new Date(a.due_date).toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge green">{a.submission_count || 0} Submissions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
