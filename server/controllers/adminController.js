const pool = require('../config/db');

// Admin dashboard
exports.getDashboard = async (req, res) => {
  try {
    // User counts by role
    const [userCounts] = await pool.query(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );

    const counts = { students: 0, teachers: 0, admins: 0, total: 0 };
    userCounts.forEach(row => {
      counts[row.role + 's'] = row.count;
      counts.total += row.count;
    });

    // Open complaints
    const [complaints] = await pool.query(
      `SELECT COUNT(*) as count FROM complaints WHERE status IN ('open', 'pending')`
    );

    // Recent signups (7 days)
    const [recentSignups] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    // Active users today (users with wellness or chat activity)
    const [activeToday] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT user_id FROM wellness_entries WHERE entry_date = CURDATE()
        UNION
        SELECT user_id FROM chat_messages WHERE DATE(created_at) = CURDATE()
       ) as active_users`
    );

    res.json({
      userCounts: counts,
      openComplaints: complaints[0].count,
      recentSignups,
      activeToday: activeToday[0].count,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, name, email, role, department, year_level, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await pool.query(query, params);

    // Total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    if (role) { countQuery += ' AND role = ?'; countParams.push(role); }
    if (search) { countQuery += ' AND (name LIKE ? OR email LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }

    const [total] = await pool.query(countQuery, countParams);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        totalPages: Math.ceil(total[0].total / limit),
      },
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User role updated.' });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get complaints
exports.getComplaints = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `SELECT c.*, u.name as user_name, u.email as user_email, r.name as resolved_by_name
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users r ON c.resolved_by = r.id`;
    const params = [];

    if (status) {
      query += ' WHERE c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.created_at DESC';

    const [complaints] = await pool.query(query, params);
    res.json({ complaints });
  } catch (err) {
    console.error('Get complaints error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update complaint status
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateFields = { status };
    if (status === 'resolved') {
      updateFields.resolved_by = req.user.id;
      updateFields.resolved_at = new Date();
    }

    await pool.query(
      'UPDATE complaints SET status = ?, resolved_by = ?, resolved_at = ? WHERE id = ?',
      [status, updateFields.resolved_by || null, updateFields.resolved_at || null, id]
    );

    res.json({ message: 'Complaint updated.' });
  } catch (err) {
    console.error('Update complaint error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, target_audience, is_pinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO announcements (admin_id, title, content, target_audience, is_pinned) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, content, target_audience || 'all', is_pinned || false]
    );

    res.status(201).json({ message: 'Announcement created.', id: result.insertId });
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const [announcements] = await pool.query(
      `SELECT a.*, u.name as admin_name
       FROM announcements a
       JOIN users u ON a.admin_id = u.id
       ORDER BY a.is_pinned DESC, a.created_at DESC`
    );
    res.json({ announcements });
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted.' });
  } catch (err) {
    console.error('Delete announcement error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// System stats
exports.getSystemStats = async (req, res) => {
  try {
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [totalWellness] = await pool.query('SELECT COUNT(*) as count FROM wellness_entries');
    const [totalAssignments] = await pool.query('SELECT COUNT(*) as count FROM assignments');
    const [totalMessages] = await pool.query('SELECT COUNT(*) as count FROM chat_messages');

    // User activity last 7 days
    const [dailyActivity] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM chat_messages
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    res.json({
      totalUsers: totalUsers[0].count,
      totalWellnessEntries: totalWellness[0].count,
      totalAssignments: totalAssignments[0].count,
      totalMessages: totalMessages[0].count,
      dailyActivity,
    });
  } catch (err) {
    console.error('System stats error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getResultsBySubject = async (req, res) => {
  try {
    const { subject } = req.query;
    
    // Get objectives
    const [objRows] = await pool.query('SELECT content FROM objectives WHERE subject = ?', [subject]);
    let objectives = [];
    if (objRows.length > 0) {
      try {
        objectives = JSON.parse(objRows[0].content);
      } catch (e) {
        objectives = [objRows[0].content];
      }
    }

    const [students] = await pool.query(`
      SELECT u.id as student_id, u.name, u.email,
        r.cca, r.lca, r.project, r.midsem, r.endsem, r.total_percentage, r.grade
      FROM users u
      JOIN academic_records r ON u.id = r.user_id AND r.subject = ?
      WHERE u.role = 'student'
      ORDER BY r.total_percentage DESC
    `, [subject]);
    
    res.json({ students, objectives });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};
