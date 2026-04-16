export default function AdminAnnouncements() {
  const announcements = [
    { title: 'System Maintenance Scheduled', content: 'The system will undergo maintenance on April 20, 2026 from 2:00 AM to 6:00 AM. Please save your work.', date: 'Apr 16, 2026', audience: 'All Users', isNew: true },
    { title: 'New Feature: AI Chatbot', content: "We're excited to announce the launch of our AI-powered chatbot! Students and teachers can now get instant help.", date: 'Apr 14, 2026', audience: 'All Users', isNew: false },
    { title: 'Mid-Semester Grades Published', content: 'Mid-semester grades are now available. Students can check their grades in the Academic section.', date: 'Apr 10, 2026', audience: 'Students', isNew: false },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm">+ New Announcement</button>
      </div>

      {announcements.map((a, i) => (
        <div key={i} className="card announcement-card" style={{ marginBottom: 16, position: 'relative' }}>
          {a.isNew && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: 'var(--blue-500)', color: 'white', textTransform: 'uppercase' }}>New</span>}
          <h4 style={{ paddingRight: a.isNew ? 40 : 0 }}>{a.title}</h4>
          <p>{a.content}</p>
          <div className="announce-meta">
            📅 {a.date} · 👁 {a.audience}
          </div>
        </div>
      ))}
    </>
  );
}
