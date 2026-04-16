const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check ownership
    const [notif] = await pool.query('SELECT id FROM notifications WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (notif.length === 0) return res.status(404).json({ message: 'Notification not found' });

    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
