import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherGiveMarks() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  const fetchAssignedSubjects = async () => {
    try {
      const res = await api.get('/teacher/dashboard');
      if (res.data?.subjects?.length > 0) {
        setSubjects(res.data.subjects);
        handleSubjectSelect(res.data.subjects[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubjectSelect = async (sub) => {
    setSelectedSubject(sub);
    try {
      const res = await api.get(`/teacher/marks/students?subject=${encodeURIComponent(sub)}`);
      setStudents(res.data);
    } catch (err) {
      showMessage('Error fetching students records');
    }
  };

  const handleSaveMarks = async (studentId, marksObj) => {
    try {
      await api.post('/teacher/marks', {
        student_id: studentId,
        subject: selectedSubject,
        ...marksObj
      });
      showMessage('Marks saved successfully!');
      handleSubjectSelect(selectedSubject);
    } catch (err) {
      showMessage('Failed to save marks');
    }
  };

  return (
    <>
      <div className="card full-width" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Manage Marks & Results</h3>
          <span className="badge blue">Select Subject</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 12 }}>
          {subjects.map(sub => (
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
        <div style={{ marginBottom: 20, padding: '16px 20px', background: message.includes('Error') || message.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') || message.includes('Failed') ? '#dc2626' : '#16a34a', border: `1px solid ${message.includes('Error') || message.includes('Failed') ? '#fecaca' : '#bbf7d0'}`, borderRadius: '12px', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {selectedSubject && (
        <div className="card full-width">
          <div className="card-header">
            <h3>Update Marks for students in {selectedSubject}</h3>
            <span className="badge purple">All Students</span>
          </div>
          <div style={{ marginTop: 16 }}>
            {students.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No students found.</p> : students.map((stu) => (
              <MarkFormRow key={stu.student_id} student={stu} onSave={(marks) => handleSaveMarks(stu.student_id, marks)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function MarkFormRow({ student, onSave }) {
  const [cca, setCca] = useState(student.cca || 0);
  const [lca, setLca] = useState(student.lca || 0);
  const [project, setProject] = useState(student.project || 0);
  const [midsem, setMidsem] = useState(student.midsem || 0);
  const [endsem, setEndsem] = useState(student.endsem || 0);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px', background: 'var(--bg)' }}>
      <div style={{ minWidth: '150px' }}>
        <strong>{student.name}</strong><br />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
        <div style={{ width: '80px' }}><small>CCA (10)</small><input type="number" max="10" className="input-group" value={cca} onChange={e=>setCca(e.target.value)} style={{ padding: '6px', width: '100%' }} /></div>
        <div style={{ width: '80px' }}><small>LCA (10)</small><input type="number" max="10" className="input-group" value={lca} onChange={e=>setLca(e.target.value)} style={{ padding: '6px', width: '100%' }} /></div>
        <div style={{ width: '90px' }}><small>Project (30)</small><input type="number" max="30" className="input-group" value={project} onChange={e=>setProject(e.target.value)} style={{ padding: '6px', width: '100%' }} /></div>
        <div style={{ width: '90px' }}><small>Mid (20)</small><input type="number" max="20" className="input-group" value={midsem} onChange={e=>setMidsem(e.target.value)} style={{ padding: '6px', width: '100%' }} /></div>
        <div style={{ width: '90px' }}><small>End (30)</small><input type="number" max="30" className="input-group" value={endsem} onChange={e=>setEndsem(e.target.value)} style={{ padding: '6px', width: '100%' }} /></div>
      </div>
      <div style={{ minWidth: '80px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{student.total_percentage || 0}%</p>
      </div>
      <div>
        <button className="btn btn-primary" onClick={() => onSave({ cca, lca, project, midsem, endsem })}>Save</button>
      </div>
    </div>
  );
}
