const pool = require('../config/db');

exports.submitTest = async (req, res) => {
  try {
    const { mood, stress_level, answers } = req.body;
    const student_id = req.user.id;
    
    // answers is an array of 10 boolean answers or scores. Calculate roughly:
    const score = Math.max(0, 100 - (stress_level * 10) + (mood === 'Happy' ? 20 : 0));
    
    await pool.query(
      'INSERT INTO wellness_records (student_id, mood, stress_level, score) VALUES (?, ?, ?, ?)',
      [student_id, mood, stress_level, score]
    );

    res.status(201).json({ message: 'Wellness test submitted successfully.', score });
  } catch (err) {
    console.error('Error submitting wellness test:', err);
    res.status(500).json({ message: 'Server error saving test.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const student_id = req.user.id;
    const [rows] = await pool.query(
      'SELECT mood, stress_level, score, date FROM wellness_records WHERE student_id = ? ORDER BY date DESC LIMIT 30',
      [student_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching wellness history:', err);
    res.status(500).json({ message: 'Server error retrieving history.' });
  }
};

exports.submitTasks = async (req, res) => {
  try {
    const { points } = req.body;
    await pool.query(
      'UPDATE gamification SET points = points + ? WHERE user_id = ?',
      [points || 10, req.user.id]
    );
    res.json({ message: 'Tasks submitted successfully.' });
  } catch(err) {
    console.error('Error submitting tasks:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

