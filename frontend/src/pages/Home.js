import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  return (
    <div>
      {/* Header */}
      <header className="home-header">
        <h1>Chào mừng bạn đến với ứng dụng điểm danh</h1>
      </header>

     {/* Nội dung chính */}
     <main className="home-main">
        <div className="content-wrapper">
          <h2 className="welcome-message">Hãy bắt đầu bằng cách đăng nhập hoặc đăng ký tài khoản</h2>
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
            <Link to="/register" className="btn btn-secondary">Đăng ký</Link>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2024 - Ứng Dụng Điểm Danh</p>
      </footer>
    </div>
  );
}

export default Home;
