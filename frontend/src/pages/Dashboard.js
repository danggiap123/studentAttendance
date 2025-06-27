import React from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css'; // Import CSS cho Dashboard

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));  // Lấy thông tin người dùng từ localStorage
  const avatarUrl = user?.profileImage
    ? `http://localhost:3000/${user.profileImage}`
    : 'https://via.placeholder.com/100';

  return (

    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="header-title">Hệ Thống Điểm Danh</h1>
      </header>

      {/* Nội dung chính */}
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <img src={avatarUrl} alt="User Avatar" className="avatar" />
          <p className="username">{user?.fullname}</p>
          <ul>
            <li><Link to="/profile">Thông tin cá nhân</Link></li>
            <li><Link to="/student-list">Danh sách sinh viên</Link></li>
            <li><Link to="/attendance">Điểm danh</Link></li>
          </ul>
        </div>
        {/* Main content */}
        <div className="dashboard-main">
          <h1>Chào mừng bạn đến với hệ thống điểm danh</h1>
          <p>Vui lòng chọn một chức năng từ thanh menu bên trái để bắt đầu.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2024 Hệ Thống Điểm Danh. All Rights Reserved.</p>
      </footer>
    </div>
  );
};
export default Dashboard;