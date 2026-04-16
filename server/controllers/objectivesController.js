const pool = require('../config/db');

exports.getObjectives = async (req, res) => {
  try {
    const { subject } = req.params;
    let query = 'SELECT content FROM objectives WHERE subject = ?';
    const params = [subject];

    const [rows] = await pool.query(query, params);
    
    if (rows.length > 0) {
      try {
        res.json(JSON.parse(rows[0].content));
      } catch (e) {
        res.json([rows[0].content]);
      }
    } else {
      res.json(['No objectives available for this subject yet.']);
    }
  } catch (err) {
    console.error('Error fetching objectives:', err);
    res.status(500).json({ message: 'Server error fetching objectives.' });
  }
};
