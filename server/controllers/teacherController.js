const pool = require('../config/db');

// Teacher dashboard
exports.getDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Total students across all classes
    const [students] = await pool.query(
      `SELECT COUNT(DISTINCT e.student_id) as total 
       FROM enrollments e 
       JOIN classes c ON e.class_id = c.id 
       WHERE c.teacher_id = ?`,
      [teacherId]
    );

    // Total classes
    const [classes] = await pool.query(
      'SELECT COUNT(*) as total FROM classes WHERE teacher_id = ?',
      [teacherId]
    );

    // Active assignments
    const [assignments] = await pool.query(
      `SELECT COUNT(*) as total FROM assignments WHERE teacher_id = ? AND status = 'active'`,
      [teacherId]
    );

    // Average attendance rate
    const [attendance] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendance a
       JOIN classes c ON a.class_id = c.id
       WHERE c.teacher_id = ?`,
      [teacherId]
    );

    // Recent submissions
    const [recentSubmissions] = await pool.query(
      `SELECT s.*, u.name as student_name, a.title as assignment_title
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE a.teacher_id = ?
       ORDER BY s.submitted_at DESC LIMIT 10`,
      [teacherId]
    );

    // Get teacher subjects
    const [teacherSubjects] = await pool.query(
      'SELECT subject_name FROM teacher_subjects WHERE teacher_id = ?',
      [teacherId]
    );

    const attendanceRate = attendance[0].total > 0
      ? Math.round((attendance[0].present / attendance[0].total) * 100)
      : 0;

    res.json({
      totalStudents: students[0].total,
      totalClasses: classes[0].total,
      activeAssignments: assignments[0].total,
      attendanceRate,
      recentSubmissions,
      subjects: teacherSubjects.map(s => s.subject_name)
    });
  } catch (err) {
    console.error('Teacher dashboard error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get classes
exports.getClasses = async (req, res) => {
  try {
    const [classes] = await pool.query(
      `SELECT c.*, COUNT(e.student_id) as student_count
       FROM classes c
       LEFT JOIN enrollments e ON c.id = e.class_id
       WHERE c.teacher_id = ?
       GROUP BY c.id`,
      [req.user.id]
    );
    res.json({ classes });
  } catch (err) {
    console.error('Get classes error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { class_id, date, records } = req.body;
    // records: [{ student_id, status }]

    if (!class_id || !date || !records || !records.length) {
      return res.status(400).json({ message: 'class_id, date, and records are required.' });
    }

    const values = records.map(r => [class_id, r.student_id, r.status, date, req.user.id]);

    // Delete existing records for this class and date
    await pool.query(
      'DELETE FROM attendance WHERE class_id = ? AND date = ?',
      [class_id, date]
    );

    // Insert new records
    await pool.query(
      'INSERT INTO attendance (class_id, student_id, status, date, marked_by) VALUES ?',
      [values]
    );

    res.json({ message: 'Attendance marked successfully.' });
  } catch (err) {
    console.error('Mark attendance error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get attendance for a class
exports.getAttendance = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { date } = req.query;

    let query = `
      SELECT a.*, u.name as student_name, u.email as student_email
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.class_id = ?`;
    const params = [class_id];

    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }

    query += ' ORDER BY a.date DESC, u.name ASC';

    const [records] = await pool.query(query, params);
    res.json({ records });
  } catch (err) {
    console.error('Get attendance error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get attendance stats
exports.getAttendanceStats = async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        a.date,
        COUNT(*) as total,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late
       FROM attendance a
       JOIN classes c ON a.class_id = c.id
       WHERE c.teacher_id = ?
       GROUP BY a.date
       ORDER BY a.date DESC LIMIT 30`,
      [req.user.id]
    );
    res.json({ stats });
  } catch (err) {
    console.error('Get attendance stats error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, subject, due_date, total_marks, start_datetime, type } = req.body;
    
    let file_url = 'mock_uploaded_file.pdf';
    if (req.file) {
      file_url = req.file.filename; // Store the filename generated by multer
    }

    if (!title || !due_date) {
      return res.status(400).json({ message: 'Title and due_date are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO assignments (teacher_id, title, description, subject, due_date, total_marks, start_date, type, file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description, subject, due_date, total_marks || 100, start_datetime || null, type || 'assignment', file_url]
    );

    res.status(201).json({ message: 'Assignment created.', id: result.insertId, file_url });
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get assignments
exports.getAssignments = async (req, res) => {
  try {
    const [assignments] = await pool.query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submission_count
       FROM assignments a
       WHERE a.teacher_id = ?
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json({ assignments });
  } catch (err) {
    console.error('Get assignments error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Grade submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { submission_id, marks_obtained, feedback } = req.body;

    await pool.query(
      'UPDATE submissions SET marks_obtained = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP WHERE id = ?',
      [marks_obtained, feedback, submission_id]
    );

    res.json({ message: 'Submission graded.' });
  } catch (err) {
    console.error('Grade submission error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Grade distribution
    const [gradeDistribution] = await pool.query(
      `SELECT 
        CASE 
          WHEN s.marks_obtained >= 90 THEN 'A'
          WHEN s.marks_obtained >= 80 THEN 'B'
          WHEN s.marks_obtained >= 70 THEN 'C'
          WHEN s.marks_obtained >= 60 THEN 'D'
          ELSE 'F'
        END as grade,
        COUNT(*) as count
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE a.teacher_id = ? AND s.marks_obtained IS NOT NULL
       GROUP BY grade
       ORDER BY grade`,
      [teacherId]
    );

    // At-risk students (low attendance or low grades)
    const [atRisk] = await pool.query(
      `SELECT u.id, u.name, u.email,
        ROUND(AVG(s.marks_obtained), 1) as avg_marks,
        (SELECT ROUND(SUM(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1)
         FROM attendance att WHERE att.student_id = u.id) as attendance_rate
       FROM users u
       JOIN submissions s ON u.id = s.student_id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE a.teacher_id = ? AND s.marks_obtained IS NOT NULL
       GROUP BY u.id
       HAVING avg_marks < 60 OR attendance_rate < 75
       LIMIT 10`,
      [teacherId]
    );

    // Performance trend per class
    const [performanceTrend] = await pool.query(
      `SELECT c.name as class_name, c.code,
        MONTH(s.submitted_at) as month,
        ROUND(AVG(s.marks_obtained), 1) as avg_score
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE a.teacher_id = ? AND s.marks_obtained IS NOT NULL
       GROUP BY c.id, MONTH(s.submitted_at)
       ORDER BY c.name, month`,
      [teacherId]
    );

    res.json({ gradeDistribution, atRisk, performanceTrend });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update Academic Marks
exports.updateMarks = async (req, res) => {
  try {
    const { student_id, subject, cca, lca, project, midsem, endsem } = req.body;

    if (!student_id || !subject) {
      return res.status(400).json({ message: 'Student ID and subject are required.' });
    }

    // CCA (10), LCA (10), Project (30), Midsem (20), Endsem (30) = 100 max
    const calcCca = Number(cca) || 0;
    const calcLca = Number(lca) || 0;
    const calcProject = Number(project) || 0;
    const calcMidsem = Number(midsem) || 0;
    const calcEndsem = Number(endsem) || 0;
    
    const totalPercentage = calcCca + calcLca + calcProject + calcMidsem + calcEndsem;

    // determine grade
    let grade = 'F';
    let gpa = 0.0;
    if (totalPercentage >= 90) { grade = 'A'; gpa = 4.0; }
    else if (totalPercentage >= 80) { grade = 'B'; gpa = 3.0; }
    else if (totalPercentage >= 70) { grade = 'C'; gpa = 2.0; }
    else if (totalPercentage >= 60) { grade = 'D'; gpa = 1.0; }

    const [existing] = await pool.query(
      'SELECT id FROM academic_records WHERE user_id = ? AND subject = ?',
      [student_id, subject]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE academic_records SET cca=?, lca=?, project=?, midsem=?, endsem=?, total_percentage=?, grade=?, gpa=?, score=? WHERE id=?',
        [calcCca, calcLca, calcProject, calcMidsem, calcEndsem, totalPercentage, grade, gpa, totalPercentage, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO academic_records (user_id, subject, semester, cca, lca, project, midsem, endsem, total_percentage, grade, gpa, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [student_id, subject, 'Current', calcCca, calcLca, calcProject, calcMidsem, calcEndsem, totalPercentage, grade, gpa, totalPercentage]
      );
    }

    res.json({ message: 'Marks updated successfully', total_percentage: totalPercentage });
  } catch (err) {
    console.error('Update marks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch Students by subject for Marks listing
exports.getStudentsForMarks = async (req, res) => {
  try {
    const { subject } = req.query;
    // For hackathon sake, we'll return all students with their records for the specified subject
    const [students] = await pool.query(`
      SELECT u.id as student_id, u.name, u.email,
        r.cca, r.lca, r.project, r.midsem, r.endsem, r.total_percentage
      FROM users u
      LEFT JOIN academic_records r ON u.id = r.user_id AND r.subject = ?
      WHERE u.role = 'student'
      ORDER BY u.name ASC
    `, [subject]);
    
    res.json(students);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { name, email, department } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, department = ? WHERE id = ?',
      [name, email, department || null, teacherId]
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (e) {
    console.error('Update profile error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
