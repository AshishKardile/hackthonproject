import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import StudentWellness from './pages/student/Wellness';
import StudentAcademic from './pages/student/Academic';
import StudentGamification from './pages/student/Gamification';
import StudentProfile from './pages/student/Profile';
import StudentResults from './pages/student/ViewResults';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherGiveMarks from './pages/teacher/GiveMarks';
import TeacherReports from './pages/teacher/Reports';
import TeacherProfile from './pages/teacher/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminSystem from './pages/admin/System';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminProfile from './pages/admin/Profile';
import AdminResults from './pages/admin/ViewResults';
import DashboardLayout from './components/DashboardLayout';

import HelpSupport from './pages/HelpSupport';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Outfit' }}>⚡</div>
          <p style={{ color: '#64748b', marginTop: '12px' }}>Loading EduWell AI...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="wellness" element={<StudentWellness />} />
        <Route path="academic" element={<StudentAcademic />} />
        <Route path="gamification" element={<StudentGamification />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="help" element={<HelpSupport />} />
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="marks" element={<TeacherGiveMarks />} />
        <Route path="reports" element={<TeacherReports />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="help" element={<HelpSupport />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="system" element={<AdminSystem />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
