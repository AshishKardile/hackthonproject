import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiBookOpen } from 'react-icons/fi';

const ALL_SUBJECTS = [
  'Data Structures and Algorithms (DSA)', 
  'Mathematics', 
  'Operating Systems (OS)', 
  'Computer Networks', 
  'Database Management Systems (DBMS)'
];

export default function AdminViewResults() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [objectives, setObjectives] = useState([]);

  const handleSubjectSelect = async (sub) => {
    setSelectedSubject(sub);
    try {
      const res = await api.get(`/admin/results?subject=${encodeURIComponent(sub)}`);
      setStudents(res.data.students);
      setObjectives(res.data.objectives);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="card full-width">
        <div className="card-header">
          <h3>Admin Panel: Student Results & Percentage</h3>
          <span className="badge blue">Select Subject</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 12 }}>
          {ALL_SUBJECTS.map(sub => (
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
              {objectives.length === 0 && <p style={{color: 'var(--text-muted)'}}>No objectives set.</p>}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Student Results Board</h3>
              <span className="badge green">Analytics</span>
            </div>
            <div style={{ marginTop: 16 }}>
              {students.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No marks entered by teacher.</p> : students.map((stu, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px', background: 'var(--bg)' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--blue-600)' }}>{stu.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{stu.email}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.8rem' }}>
                      <span>CCA: <b>{stu.cca}</b></span>
                      <span>LCA: <b>{stu.lca}</b></span>
                      <span>PRJ: <b>{stu.project}</b></span>
                      <span>MID: <b>{stu.midsem}</b></span>
                      <span>END: <b>{stu.endsem}</b></span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', paddingLeft: 16, borderLeft: '1px dashed var(--border)' }}>
                    <h2 style={{ margin: 0 }}>{stu.total_percentage || 0}%</h2>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{stu.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
