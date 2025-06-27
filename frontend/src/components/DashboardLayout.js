import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DashboardLayout.css';

function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:3000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUser(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const avatarUrl = user?.profileImage
    ? `http://localhost:3000/${user.profileImage}`
    : 'https://via.placeholder.com/100';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <img src={avatarUrl} alt="Avatar" className="profile-img" />
        <p className="username">{user?.fullname}</p>
        <ul className="nav-links">
          <li>
            <Link to="/profile">Thông tin cá nhân</Link>
          </li>
          <li>
            <Link to="/student-list">Danh sách sinh viên</Link>
          </li>
          <li>
            <Link to="/attendance">Điểm danh</Link>
          </li>
          <li>
            <button className="logout-button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
      <div className="dashboard-content">{children}</div>
    </div>
  );
}

export default DashboardLayout;
