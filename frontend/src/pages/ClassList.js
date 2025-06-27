import React from 'react';
import { Link } from 'react-router-dom'; // Link for navigation
import './ClassList.css'; // Import CSS for styling

const ClassList = () => {
  // Example data for class list (this can be fetched from an API)
  const classData = [
    { id: 1, className: "Mathematics 101", instructor: "Dr. John Doe", time: "Mon, Wed, Fri 10:00 - 11:30 AM" },
    { id: 2, className: "Physics 202", instructor: "Prof. Jane Smith", time: "Tue, Thu 2:00 - 3:30 PM" },
    { id: 3, className: "Computer Science 303", instructor: "Dr. Emily Clark", time: "Mon, Wed 1:00 - 2:30 PM" },
    // Add more classes as needed
  ];

  const user = JSON.parse(localStorage.getItem('user'));  // Get user info from localStorage
  const avatarUrl = user?.avatar || '/path/to/default-avatar.jpg';  // Use default avatar if none exists

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="header-title">Hệ Thống Điểm Danh</h1>
      </header>

      {/* Main content */}
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <img src={avatarUrl} alt="User Avatar" className="avatar" />
          <p className="username">{user?.username}</p>
          <ul>
            <li><Link to="/profile">Thông tin cá nhân</Link></li>
            <li><Link to="/class-list">Danh sách lớp</Link></li>
            <li><Link to="/attendance">Điểm danh</Link></li>
          </ul>
        </div>

        {/* Main class list content */}
        <div className="dashboard-main">
          <h2 className="page-title">Class List</h2>

          <table className="class-list-table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Instructor</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {classData.map((classItem) => (
                <tr key={classItem.id}>
                  <td>{classItem.className}</td>
                  <td>{classItem.instructor}</td>
                  <td>{classItem.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2024 Hệ Thống Điểm Danh. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default ClassList;
