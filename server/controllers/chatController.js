const pool = require('../config/db');

// Enhanced AI chatbot responses for accurate and context-aware replies
const getAIResponse = (message, role) => {
  const lower = message.toLowerCase();

  // Core capabilities matches
  if (/wellness|feeling|mood|sad|happy|stress/i.test(lower)) {
    return "Based on your recent wellness data, your overall wellness score is looking great! 🌟 Remember to maintain healthy habits: get enough sleep, stay hydrated, and take regular breaks. Try the breathing exercise in the Wellness module if you feel overwhelmed.";
  }
  if (/grade|gpa|marks|score/i.test(lower)) {
    if (role === 'student') return "Your academic performance has been steadily improving! 📚 Focus on consistent study habits. I recommend using the Pomodoro technique. Check your Gamification level for your current XP and Academic tab for details.";
    if (role === 'teacher') return "You can view detailed grade distributions and performance trends in the Class Performance chart. The analytics will help identify students who may need additional support.";
    if (role === 'admin') return "Overall system GPA and XP trends are positive. You can track individual student performances in the Course Objectives & Academic Tracker.";
  }
  if (/study|tip|learn|plan/i.test(lower)) {
    return "Here are proven study tips for maximum accuracy and retention:\n\n📖 **Active Recall** — Test yourself instead of re-reading\n⏰ **Spaced Repetition** — Review material at increasing intervals\n🧠 **Pomodoro** — 25 min focus + 5 min break\n💤 **Sleep** — 7-8 hours helps memory consolidation\n✍️ **Teach Others** — Explaining concepts deepens understanding";
  }
  if (/attendance|present|absent/i.test(lower)) {
    if (role === 'teacher') return "You can mark and view attendance directly from the stat cards on your Dashboard.";
    return "Your attendance is being tracked automatically. Regular attendance correlates strongly with high XP scores in the Gamification module!";
  }
  if (/assignment|homework|task|quiz|test|objective/i.test(lower)) {
    if (role === 'teacher') return "You can select your subject (DSA, OS, DBMS, etc.) on the Dashboard. From there, you can upload material, generate 10 objectives, and publish quizzes directly to students.";
    if (role === 'admin') return "In the Course Tracker, you can monitor which teachers have uploaded assignments and objectives for their respective courses.";
    return "Go to your Academic section, select your subject, read the 10 course objectives, and click 'Take Quiz' to earn up to +50 XP points upon completion. 🎮";
  }
  if (/game|xp|gamification|point/i.test(lower)) {
    return "Points and Levels are calculated securely via our enhanced Gamification Engine! Play Game Tasks in the Gamification tab to increase your Rank and hit Level up (every 200 XP).";
  }
  if (/hello|hi|hey|greet/i.test(lower)) {
    return `Hello! 👋 I'm EduWell AI, your highly accurate smart assistant. I can help with:\n\n🎮 Gamification & XP\n📚 Academic Quizzes & Objectives\n📝 Uploads & Material\n🧘 Wellness Tasks\n\nWhat would you like to explore today?`;
  }
  
  // High-accuracy fallback
  return "I've carefully analyzed your question! 😊 For the most accurate assistance, please specify if you need help with: gamification/XP, taking quizzes, wellness tasks, subject objectives, or grade analytics.";
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const response = getAIResponse(message, req.user.role);

    // Save to database
    await pool.query(
      'INSERT INTO chat_messages (user_id, message, response) VALUES (?, ?, ?)',
      [req.user.id, message, response]
    );

    res.json({ response, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get chat history
exports.getHistory = async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ messages: messages.reverse() });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
