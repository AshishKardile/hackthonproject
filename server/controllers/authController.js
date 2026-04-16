const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, year_level } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department, year_level) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, department || null, year_level || null]
    );

    // Create gamification record for students
    if (role === 'student') {
      await pool.query(
        'INSERT INTO gamification (user_id, points, level, streak_days) VALUES (?, 0, 1, 0)',
        [result.insertId]
      );
    } else if (role === 'teacher' && req.body.teacher_subjects) {
      // teacher_subjects should be an open select or array, let's assume it's a string from UI initially
      await pool.query(
        'INSERT INTO teacher_subjects (teacher_id, subject_name) VALUES (?, ?)',
        [result.insertId, req.body.teacher_subjects]
      );
    }

    // Generate token
    const token = jwt.sign(
      { id: result.insertId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: result.insertId, name, email, role, department, year_level },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    let query = 'SELECT * FROM users WHERE email = ?';
    const params = [email];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const [users] = await pool.query(query, params);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials or role mismatch.' });
    }

    const user = users[0];

    // Compare password (with fallback for manually inserted plain-text passwords)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch(e) {}
    
    if (!isMatch && password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year_level: user.year_level,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, department, year_level, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: users[0] });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, department, year_level, password } = req.body;

    let updateQuery = 'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), department = COALESCE(?, department), year_level = COALESCE(?, year_level) ';
    const params = [name, email, department, year_level];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += ', password = ? ';
      params.push(hashedPassword);
    }
    updateQuery += 'WHERE id = ?';
    params.push(req.user.id);

    await pool.query(updateQuery, params);

    const [users] = await pool.query(
      'SELECT id, name, email, role, department, year_level, avatar FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Profile updated.', user: users[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
