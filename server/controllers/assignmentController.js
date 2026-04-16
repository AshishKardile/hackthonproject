const pool = require('../config/db');

exports.createAssignment = async (req, res) => {
  try {
    const { title, description, subject, file_url, due_date, start_datetime, type } = req.body;
    const teacher_id = req.user.id; // user id from JWT

    if (!title || !subject || !due_date) {
      return res.status(400).json({ message: 'Title, subject, and due date are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO assignments (teacher_id, title, description, subject, file_url, due_date, start_date, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [teacher_id, title, description, subject, file_url, due_date, start_datetime || null, type || 'assignment']
    );

    // Notify all students
    const [students] = await pool.query("SELECT id FROM users WHERE role = 'student'");
    for (const student of students) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [student.id, 'New Assignment Uploaded', `Teacher uploaded a new assignment for ${subject}: ${title}`, 'assignment_new']
      );
    }

    res.status(201).json({ message: 'Assignment created successfully.', id: result.insertId });
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const role = req.user.role;
    let query = `
      SELECT a.*, u.name as teacher_name 
      FROM assignments a 
      JOIN users u ON a.teacher_id = u.id 
      ORDER BY a.created_at DESC
    `;
    let params = [];

    if (role === 'teacher') {
      query = `
        SELECT a.*, u.name as teacher_name 
        FROM assignments a 
        JOIN users u ON a.teacher_id = u.id 
        WHERE a.teacher_id = ? 
        ORDER BY a.created_at DESC
      `;
      params = [req.user.id];
    } else if (role === 'student' && req.query.subject) {
      query = `
        SELECT a.*, u.name as teacher_name 
        FROM assignments a 
        JOIN users u ON a.teacher_id = u.id 
        WHERE a.subject = ? 
        ORDER BY a.created_at DESC
      `;
      params = [req.query.subject];
    }

    const [assignments] = await pool.query(query, params);
    
    // If student, check if they have submitted
    if (role === 'student') {
      for (const assignment of assignments) {
        const [sub] = await pool.query('SELECT id, file_url, submitted_at FROM submissions WHERE assignment_id = ? AND student_id = ?', [assignment.id, req.user.id]);
        assignment.submission = sub.length > 0 ? sub[0] : null;
      }
    }

    res.json(assignments);
  } catch (err) {
    console.error('Get assignments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { assignment_id, file_url } = req.body;
    const student_id = req.user.id;

    if (!assignment_id || !file_url) {
      return res.status(400).json({ message: 'Assignment ID and file URL are required.' });
    }

    // Check if assignment exists
    const [assignments] = await pool.query('SELECT * FROM assignments WHERE id = ?', [assignment_id]);
    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const assignment = assignments[0];

    // Check if already submitted
    const [existing] = await pool.query('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?', [assignment_id, student_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already submitted this assignment.' });
    }

    const [result] = await pool.query(
      'INSERT INTO submissions (assignment_id, student_id, file_url) VALUES (?, ?, ?)',
      [assignment_id, student_id, file_url]
    );

    // Notify Teacher
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [assignment.teacher_id, 'Assignment Submitted', `Student ${req.user.name} submitted assignment for ${assignment.subject}: ${assignment.title}`, 'submission']
    );

    res.status(201).json({ message: 'Assignment submitted successfully.', id: result.insertId });
  } catch (err) {
    console.error('Submit assignment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    
    // Check if teacher owns this assignment
    if (req.user.role === 'teacher') {
      const [assignments] = await pool.query('SELECT id FROM assignments WHERE id = ? AND teacher_id = ?', [assignment_id, req.user.id]);
      if (assignments.length === 0) {
        return res.status(403).json({ message: 'Unauthorized access to this assignment.' });
      }
    }

    const [submissions] = await pool.query(`
      SELECT s.*, u.name as student_name, u.email as student_email 
      FROM submissions s 
      JOIN users u ON s.student_id = u.id 
      WHERE s.assignment_id = ?
    `, [assignment_id]);

    res.json(submissions);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
