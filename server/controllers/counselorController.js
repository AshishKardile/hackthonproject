const pool = require('../config/db');

exports.bookSession = async (req, res) => {
  try {
    const { booking_date, booking_time, reason } = req.body;
    const student_id = req.user.id;

    if (!booking_date || !booking_time) {
      return res.status(400).json({ message: 'Date and time are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO counselor_bookings (student_id, booking_date, booking_time, reason) VALUES (?, ?, ?, ?)',
      [student_id, booking_date, booking_time, reason]
    );

    res.status(201).json({ message: 'Session booked successfully.', id: result.insertId });
  } catch (err) {
    console.error('Book session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const role = req.user.role;
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = `
        SELECT cb.*, u.name as student_name, u.email as student_email 
        FROM counselor_bookings cb 
        JOIN users u ON cb.student_id = u.id 
        ORDER BY cb.booking_date DESC, cb.booking_time DESC
      `;
    } else if (role === 'student') {
      query = `
        SELECT * FROM counselor_bookings WHERE student_id = ? 
        ORDER BY booking_date DESC, booking_time DESC
      `;
      params = [req.user.id];
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const [bookings] = await pool.query(query, params);
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
