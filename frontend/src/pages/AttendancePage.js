import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout'; // Đảm bảo import đúng đường dẫn
import './AttendancePage.css'; // CSS file riêng cho trang điểm danh

const AttendancePage = () => {
  return (
    <DashboardLayout>
      <div className="attendance-page">
        <h1>Điểm Danh Sinh Viên</h1>
        <div className="attendance-options">
          <Link to="/attendance/manual">
            <button className="attendance-btn">Điểm Danh Bằng Tay</button>
          </Link>
          <Link to="/attendance/realtime">
            <button className="attendance-btn">Điểm Danh Thời Gian Thực</button>
          </Link>
        </div>
      </div>
      <footer className="real-attenndance-footer">
        <p>&copy; 2024 - Ứng Dụng Điểm Danh. All Rights Reserved.</p>
      </footer>
    </DashboardLayout>
  );
};

export default AttendancePage;