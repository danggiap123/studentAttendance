// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './index.css'
import Login from './pages/Login'; // Đường dẫn đúng đến Login.js
import Register from './pages/Register';

// Import các trang và component
import Home from './pages/Home';
import AttendancePage from './pages/AttendancePage';
import StudentListPage from './pages/StudentListPage';
import Dashboard from './pages/Dashboard'; // import Dashboard component
import Profile from './pages/Profile'; // Đảm bảo Profile.js có tồn tại trong src/pages/
import UpdateProfile from './pages/UpdateProfile'; // Đảm bảo UpdateProfile.js có tồn tại trong src/pages/
import AddStudentPage from './pages/AddStudentPage'; // Đảm bảo AddStudentPage.js có tồn tại trong src/pages/
import AddStudentByFile from './pages/AddStudentByFile';
import StudentProfile from './pages/StudentProfile';
import UpdateStudent from './pages/UpdateStudent';
import ManualAttendancePage from './pages/ManualAttendancePage';
import AttendanceRealtimePage from './pages/RealtimeAttendancePage';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/update" element={<UpdateProfile />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/student-list" element={<StudentListPage />} />
          <Route path="/students/profile/:studentId" element={<StudentProfile />} />
          <Route path="/students/update/:studentId" element={<UpdateStudent />} />
          <Route path="/add-student" element={<AddStudentPage />} />
          <Route path="/add-student/file" element={<AddStudentByFile />} />
          <Route path="/attendance/manual" element={<ManualAttendancePage />} />
          <Route path="/attendance/realtime" element={<AttendanceRealtimePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
