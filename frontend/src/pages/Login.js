import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for the login process
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Set loading state to true when the login starts
    setLoading(true);

    // Ensure email and password are not empty
    if (!email || !password) {
      setMessage('Email và mật khẩu không được để trống!');
      setLoading(false);
      return;
    }

    // Send login request to the backend with email and password
    axios
      .post('http://localhost:3000/api/login', { email, password })
      .then((response) => {
        // Store token in localStorage after successful login
        localStorage.setItem('token', response.data.token);

        // Show success message and navigate to dashboard after a short delay
        setMessage('Đăng nhập thành công!');
        setTimeout(() => navigate('/profile'), 1000);
      })
      .catch((error) => {
        // Handle errors such as incorrect login details or server errors
        if (error.response) {
          setMessage(error.response.data.message || 'Email hoặc mật khẩu không đúng!');
        } else if (error.request) {
          setMessage('Lỗi kết nối mạng, vui lòng thử lại!');
        } else {
          setMessage('Đã xảy ra lỗi, vui lòng thử lại!');
        }
      })
      .finally(() => {
        // Set loading state to false after the login process ends
        setLoading(false);
      });
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Đăng nhập vào ứng dụng</h1>
      </header>

      <main className="home-main">
        <div className="content-wrapper">
          <h2 className="welcome-message">Hãy nhập thông tin đăng nhập của bạn</h2>

          {/* Display message if available */}
          {message && <p className="login-message">{message}</p>}

          {/* Login form */}
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2024 - Ứng Dụng Điểm Danh</p>
      </footer>
    </div>
  );
}

export default Login;
