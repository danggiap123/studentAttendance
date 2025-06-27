import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './AddStudentPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function AddStudentPage() {
  const [studentId, setStudentId] = useState('');
  const [fullname, setFullname] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');  // Added state for email
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imageLeft, setImageLeft] = useState(null);
  const [imageRight, setImageRight] = useState(null);
  const [message, setMessage] = useState('');
  const history = useNavigate();

  // Handle adding student manually
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form is being submitted...");
    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('fullname', fullname);
    formData.append('dob', dob);
    formData.append('school', school);
    formData.append('major', major);
    formData.append('email', email);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    if (imageLeft) {
      formData.append('imageLeft', imageLeft);
    }
    if (imageRight) {
      formData.append('imageRight', imageRight);
    }
    console.log("Form Data: ", {
      studentId,
      fullname,
      dob,
      email,
      school,
      major,
      profileImage,
      imageLeft,
      imageRight,
    });
    try {
      const response = await axios.post('http://localhost:3000/api/students/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Lỗi khi thêm sinh viên:', error);
      setMessage('Không thể thêm sinh viên. Vui lòng thử lại.');
    }
  };
  // Navigate to "Add student from file" page
  const handleGoToAddByFile = () => {
    history('/add-student/file');
  };



  return (
    <DashboardLayout>
      <div className="add-student-page">
        {/* Buttons for file upload and scan */}
        <div className="upload-section">
          <button onClick={handleGoToAddByFile}>Thêm Sinh Viên Từ File Excel</button>
        </div>
        <h1>Thêm Sinh Viên</h1>

        {/* Manual student addition form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mã Sinh Viên:</label>
            <input 
              type="text" 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Họ Tên:</label>
            <input 
              type="text" 
              value={fullname} 
              onChange={(e) => setFullname(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Ngày Sinh:</label>
            <input 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Trường:</label>
            <input 
              type="text" 
              value={school} 
              onChange={(e) => setSchool(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Ngành Học:</label>
            <input 
              type="text" 
              value={major} 
              onChange={(e) => setMajor(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Ảnh Đại Diện:</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files[0])}
            />
          {/* </div>
          <div className="form-group">
            <label>Ảnh Bên Trái:</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImageLeft(e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label>Ảnh Bên Phải:</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImageRight(e.target.files[0])}
            /> */}
          </div>
          <button type="submit" className="btn btn-primary btn-lg mb-5">Thêm Sinh Viên</button>
        </form>

        {message && <p>{message}</p>}
        
      </div>
    </DashboardLayout>
  );
}

export default AddStudentPage;
