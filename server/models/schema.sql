-- =============================================
-- EduWell AI — Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS eduwell_ai;
USE eduwell_ai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  avatar VARCHAR(255) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  year_level VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Wellness entries
CREATE TABLE IF NOT EXISTS wellness_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  mood ENUM('great', 'good', 'okay', 'low', 'bad') NOT NULL,
  stress_level INT DEFAULT 0 CHECK (stress_level BETWEEN 0 AND 100),
  sleep_hours DECIMAL(3,1) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  entry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Academic records
CREATE TABLE IF NOT EXISTS academic_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  grade VARCHAR(5) DEFAULT NULL,
  score DECIMAL(5,2) DEFAULT NULL,
  gpa DECIMAL(3,2) DEFAULT NULL,
  semester VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  teacher_id INT NOT NULL,
  schedule VARCHAR(255) DEFAULT NULL,
  room VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Class enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (class_id, student_id)
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'present',
  date DATE NOT NULL,
  marked_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  class_id INT DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  subject VARCHAR(100) DEFAULT NULL,
  due_date DATE NOT NULL,
  total_marks INT DEFAULT 100,
  status ENUM('active', 'closed', 'draft') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  content TEXT DEFAULT NULL,
  marks_obtained INT DEFAULT NULL,
  feedback TEXT DEFAULT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_submission (assignment_id, student_id)
);

-- Gamification
CREATE TABLE IF NOT EXISTS gamification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  points INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  last_activity_date DATE DEFAULT NULL,
  badges JSON DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target_audience ENUM('all', 'students', 'teachers') DEFAULT 'all',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Complaints / Tickets
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'pending', 'resolved', 'closed') DEFAULT 'open',
  resolved_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- Seed Data
-- =============================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role, department) VALUES
('System Admin', 'admin@eduwell.com', '$2a$10$6jM5Z8V5Z5Z5Z5Z5Z5Z5ZeKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQK', 'admin', 'Administration');

-- Teachers (password: teacher123)
INSERT INTO users (name, email, password, role, department) VALUES
('Dr. Robert Smith', 'robert@eduwell.com', '$2a$10$6jM5Z8V5Z5Z5Z5Z5Z5Z5ZeKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQK', 'teacher', 'Computer Science'),
('Prof. Lisa Johnson', 'lisa@eduwell.com', '$2a$10$6jM5Z8V5Z5Z5Z5Z5Z5Z5ZeKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQK', 'teacher', 'Mathematics');

-- Students (password: student123)
INSERT INTO users (name, email, password, role, department, year_level) VALUES
('VedDangat', 'ved@eduwell.com', 'VEDd@123', 'student', 'Computer Science', '2nd Year'),
('Alex Chen', 'alex@eduwell.com', '$2a$10$6jM5Z8V5Z5Z5Z5Z5Z5Z5ZeKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQK', 'student', 'Computer Science', '2nd Year'),
('Maya Patel', 'maya@eduwell.com', '$2a$10$6jM5Z8V5Z5Z5Z5Z5Z5Z5ZeKQKQKQKQKQKQKQKQKQKQKQKQKQKQKQK', 'student', 'Electronics', '3rd Year');
