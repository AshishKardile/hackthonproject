const pool = require('../config/db');

// Get student dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get latest wellness entry
    const [wellness] = await pool.query(
      'SELECT * FROM wellness_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT 1',
      [userId]
    );

    // Get GPA (latest semester)
    const [gpa] = await pool.query(
      'SELECT AVG(gpa) as avg_gpa FROM academic_records WHERE user_id = ? AND gpa IS NOT NULL',
      [userId]
    );

    // Get attendance rate
    const [attendance] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
      FROM attendance WHERE student_id = ?`,
      [userId]
    );

    // Get pending assignments count
    const [assignments] = await pool.query(
      `SELECT COUNT(*) as pending FROM assignments a 
       LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
       WHERE a.status = 'active' AND s.id IS NULL AND a.due_date >= CURDATE()`,
      [userId]
    );

    // Get gamification data
    const [gamification] = await pool.query(
      'SELECT * FROM gamification WHERE user_id = ?',
      [userId]
    );

    const attendanceRate = attendance[0].total > 0
      ? Math.round((attendance[0].present / attendance[0].total) * 100)
      : 0;

    res.json({
      wellness: wellness[0] || null,
      gpa: gpa[0]?.avg_gpa ? parseFloat(gpa[0].avg_gpa).toFixed(2) : '0.00',
      attendance: attendanceRate,
      pendingAssignments: assignments[0].pending,
      gamification: gamification[0] || { points: 0, level: 1, streak_days: 0 },
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get wellness entries
exports.getWellness = async (req, res) => {
  try {
    const [entries] = await pool.query(
      'SELECT * FROM wellness_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT 30',
      [req.user.id]
    );
    res.json({ entries });
  } catch (err) {
    console.error('Get wellness error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Log wellness entry
exports.logWellness = async (req, res) => {
  try {
    const { mood, stress_level, sleep_hours, notes } = req.body;
    const entry_date = new Date().toISOString().split('T')[0];

    // Upsert — one entry per day
    const [existing] = await pool.query(
      'SELECT id FROM wellness_entries WHERE user_id = ? AND entry_date = ?',
      [req.user.id, entry_date]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE wellness_entries SET mood = ?, stress_level = ?, sleep_hours = ?, notes = ? WHERE id = ?',
        [mood, stress_level || 0, sleep_hours, notes, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO wellness_entries (user_id, mood, stress_level, sleep_hours, notes, entry_date) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, mood, stress_level || 0, sleep_hours, notes, entry_date]
      );
    }

    // Award gamification points for logging wellness
    await pool.query(
      'UPDATE gamification SET points = points + 10 WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ message: 'Wellness entry saved.' });
  } catch (err) {
    console.error('Log wellness error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get academic records
exports.getAcademics = async (req, res) => {
  try {
    const [records] = await pool.query(
      'SELECT * FROM academic_records WHERE user_id = ? ORDER BY semester DESC, subject ASC',
      [req.user.id]
    );

    // Get GPA per semester
    const [gpaTrend] = await pool.query(
      'SELECT semester, AVG(gpa) as avg_gpa FROM academic_records WHERE user_id = ? AND gpa IS NOT NULL GROUP BY semester ORDER BY semester',
      [req.user.id]
    );

    res.json({ records, gpaTrend });
  } catch (err) {
    console.error('Get academics error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get student attendance
exports.getAttendance = async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT a.*, c.name as class_name, c.code as class_code
       FROM attendance a
       JOIN classes c ON a.class_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.date DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ records });
  } catch (err) {
    console.error('Get attendance error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get student assignments
exports.getAssignments = async (req, res) => {
  try {
    const [assignments] = await pool.query(
      `SELECT a.*, s.submitted_at, s.marks_obtained, s.feedback,
        u.name as teacher_name
       FROM assignments a
       JOIN users u ON a.teacher_id = u.id
       LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
       WHERE a.class_id IN (SELECT class_id FROM enrollments WHERE student_id = ?)
       ORDER BY a.due_date DESC`,
      [req.user.id, req.user.id]
    );
    res.json({ assignments });
  } catch (err) {
    console.error('Get assignments error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignment_id, content } = req.body;

    await pool.query(
      'INSERT INTO submissions (assignment_id, student_id, content) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content = ?, submitted_at = CURRENT_TIMESTAMP',
      [assignment_id, req.user.id, content, content]
    );

    // Award points
    await pool.query(
      'UPDATE gamification SET points = points + 25 WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ message: 'Assignment submitted successfully.' });
  } catch (err) {
    console.error('Submit assignment error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get gamification data
exports.getGamification = async (req, res) => {
  try {
    const [data] = await pool.query(
      'SELECT * FROM gamification WHERE user_id = ?',
      [req.user.id]
    );

    // Get leaderboard
    const [leaderboard] = await pool.query(
      `SELECT g.*, u.name, u.avatar 
       FROM gamification g 
       JOIN users u ON g.user_id = u.id 
       WHERE u.role = 'student'
       ORDER BY g.points DESC LIMIT 10`
    );

    // Get user rank
    const [rank] = await pool.query(
      `SELECT COUNT(*) + 1 as rank FROM gamification g
       JOIN users u ON g.user_id = u.id
       WHERE u.role = 'student' AND g.points > (SELECT points FROM gamification WHERE user_id = ?)`,
      [req.user.id]
    );

    res.json({
      data: data[0] || { points: 0, level: 1, streak_days: 0, badges: [] },
      leaderboard,
      rank: rank[0]?.rank || 1,
    });
  } catch (err) {
    console.error('Get gamification error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
