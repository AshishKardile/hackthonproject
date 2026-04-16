import { FiMail, FiPhone, FiInfo, FiHelpCircle } from 'react-icons/fi';

export default function HelpSupport() {
  return (
    <div className="page-content" style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="hero-card admin" style={{ background: 'linear-gradient(135deg, #10b981, #047857)', marginBottom: 24 }}>
        <div className="hero-content">
          <div>
            <p className="hero-label">We are here to help!</p>
            <h1 className="hero-value" style={{ fontSize: '2rem' }}>Help & Support</h1>
            <p className="hero-status">Contact administrators or teachers for assistance.</p>
          </div>
          <div style={{ fontSize: 64, opacity: 0.2 }}>
            <FiHelpCircle />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Admin Contacts</h3>
            <span className="badge blue">Technical Support</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMail size={20} /></div>
              <div>
                <p style={{ fontWeight: 600 }}>IT Helpdesk</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>support@eduwell.edu</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPhone size={20} /></div>
              <div>
                <p style={{ fontWeight: 600 }}>Emergency Hotline</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Academic Offices</h3>
            <span className="badge purple">Teachers & Counselors</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--purple-100)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiInfo size={20} /></div>
              <div>
                <p style={{ fontWeight: 600 }}>Counseling Center</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>counseling@eduwell.edu</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--pink-100)', color: 'var(--pink-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMail size={20} /></div>
              <div>
                <p style={{ fontWeight: 600 }}>Academic Dean</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>academic@eduwell.edu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
