import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateStudent.css'; // CSS file riêng cho trang cập nhật thông tin sinh viên

const UpdateStudent = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({
    fullname: '',
    dob: '',
    school: '',
    major: '',
    email: '',
    profileImage: null,
  });
  const [message, setMessage] = useState('');

  // Hàm lấy dữ liệu sinh viên từ API
  const fetchStudentData = () => {
    axios.get(`http://localhost:3000/api/students/${studentId}`)
      .then((response) => {
        const studentData = response.data;
        if (studentData.dob) {
          studentData.dob = new Date(studentData.dob).toISOString().split('T')[0]; // Định dạng "yyyy-MM-dd"
        }
        setStudent(studentData);
      })
      .catch((error) => console.error('Lỗi khi lấy thông tin sinh viên:', error));
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setStudent({ ...student, [name]: files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('fullname', student.fullname);
    formData.append('dob', student.dob);
    formData.append('school', student.school);
    formData.append('major', student.major);
    formData.append('email', student.email);
    if (student.profileImage) {
      formData.append('profileImage', student.profileImage);
    }

    axios.put(`http://localhost:3000/api/students/update/${studentId}`, formData)
      .then((response) => {
        setMessage('Cập nhật thông tin thành công!');
        setTimeout(() => {
          // Lấy lại thông tin sinh viên sau khi cập nhật thành công
          fetchStudentData();
          navigate(`/students/profile/${studentId}`);
        }, 1000); // Thêm thời gian chờ ngắn trước khi điều hướng
      })
      .catch((error) => {
        console.error('Lỗi khi cập nhật thông tin sinh viên:', error);
        setMessage('Cập nhật thông tin thất bại.');
      });
  };

  return (
    <div className="update-student">
      <h1>Cập Nhật Thông Tin Sinh Viên</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Họ và Tên:</label>
          <input
            type="text"
            name="fullname"
            value={student.fullname}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ngày Sinh:</label>
          <input
            type="date"
            name="dob"
            value={student.dob}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Trường:</label>
          <input
            type="text"
            name="school"
            value={student.school}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ngành:</label>
          <input
            type="text"
            name="major"
            value={student.major}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={student.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ảnh Đại Diện:</label>
          <input
            type="file"
            name="profileImage"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit">Cập nhật</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateStudent;
