import { useState, useRef, useEffect } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import api from '../services/api';

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi there! 👋 I'm EduWell AI assistant. How can I help you today?", time: 'Just now' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setMessages(prev => [...prev, { type: 'user', text, time: 'Just now' }]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/chat/send', { message: text });
      setMessages(prev => [...prev, { type: 'bot', text: res.data.response, time: 'Just now' }]);
    } catch {
      // Fallback offline response
      const fallback = getOfflineResponse(text);
      setMessages(prev => [...prev, { type: 'bot', text: fallback, time: 'Just now' }]);
    } finally {
      setSending(false);
    }
  };

  const getOfflineResponse = (msg) => {
    const lower = msg.toLowerCase();
    if (/wellness|mood|stress/.test(lower)) return "Your wellness score is looking great! 🌟 Keep up the healthy habits, and try the breathing exercise!";
    if (/grade|gpa|mark/.test(lower)) return "Check the Academic section for detailed analytics! 📚 Your trend is highly positive.";
    if (/study|tip/.test(lower)) return "Try the Pomodoro technique: 25 min focus + 5 min break for maximum retention 📖";
    if (/game|xp|gamification|point/.test(lower)) return "Points and Levels are calculated via Gamification! Play Game Tasks to increase your Level.";
    if (/assignment|quiz|objective|course/.test(lower)) return "Go to the Academic or Dashboard tab to view course objectives and complete pending quizzes.";
    return "Thanks for your message! 😊 I can help with gamification, wellness, grades, study tips, and subject objectives.";
  };

  const suggestions = ["How's my wellness?", "Study tips", "Check my grades"];

  return (
    <div className="chatbot-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RiRobot2Line size={28} color="var(--blue-500)" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>EduWell AI</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--green-500)' }}>● Online</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><FiX size={20} /></button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.type}`}>
              <div className="chat-avatar" style={msg.type === 'user' ? { background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' } : {}}>
                {msg.type === 'bot' ? <RiRobot2Line size={16} /> : '👤'}
              </div>
              <div className="chat-bubble">
                <p>{msg.text}</p>
                <span className="chat-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {sending && (
            <div className="chat-msg bot">
              <div className="chat-avatar"><RiRobot2Line size={16} /></div>
              <div className="chat-bubble"><p>Thinking... 💭</p></div>
            </div>
          )}
          <div ref={messagesEndRef} />

          {messages.length === 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingLeft: '42px' }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setInput(s); }}
                  style={{
                    padding: '8px 14px', border: '1.5px solid var(--blue-200)', borderRadius: '20px',
                    fontSize: '0.8rem', fontWeight: 500, color: 'var(--blue-600)', background: 'var(--blue-50)', cursor: 'pointer',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button className="chat-send-btn" onClick={sendMessage} disabled={sending}>
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
