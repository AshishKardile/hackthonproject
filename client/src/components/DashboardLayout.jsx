import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import ChatBot from './ChatBot';
import { FiMessageSquare } from 'react-icons/fi';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <TopHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      {/* Chatbot FAB */}
      <button className="fab" onClick={() => setChatOpen(true)} title="AI Chatbot">
        <FiMessageSquare />
      </button>

      {/* Chatbot */}
      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
    </div>
  );
}
