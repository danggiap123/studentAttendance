import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import './profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.get('http://localhost:3000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const avatarUrl = user?.profileImage
    ? `http://localhost:3000/${user.profileImage}`
    : 'https://via.placeholder.com/150';

  const formatDateOfBirth = (dob) => {
    if (!dob) return '';
    const date = new Date(dob);
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="profile-container">
        <h2>Thông tin người dùng</h2>
        <div className="profile-details">
          <div className="profile-header">
            <div className="profile-avatar">
              <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
            </div>
            <div className="profile-info">
              <p><strong>Tên người dùng:</strong> {user?.fullname}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Số điện thoại:</strong> {user?.phone}</p>
              <p><strong>Ngày sinh:</strong> {formatDateOfBirth(user?.dob)}</p>
              <p><strong>Giới tính:</strong> {user?.gender}</p>
              <p><strong>Địa chỉ:</strong></p>
              <div className="address-container">
                <p><strong>Tỉnh:</strong> {user?.province}</p>
                <p><strong>Huyện:</strong> {user?.district}</p>
                <p><strong>Xã:</strong> {user?.commune}</p>
                <p><strong>Thôn:</strong> {user?.village}</p>
              </div>
            </div>
          </div>
          <a href="/profile/update">
            <button className="update-button">Cập nhật thông tin</button>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;