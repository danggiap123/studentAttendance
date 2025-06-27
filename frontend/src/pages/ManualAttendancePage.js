import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout'; // Đảm bảo import đúng đường dẫn
import './ManualAttendancePage.css'; // CSS file riêng cho trang điểm danh bằng tay

const ManualAttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState('');

  // Lấy danh sách sinh viên từ API
  useEffect(() => {
    axios.get('http://localhost:3000/api/students')
      .then((response) => {
        const sortedStudents = response.data.sort((a, b) => a.fullname.localeCompare(b.fullname));
        setStudents(sortedStudents);
      })
      .catch((error) => console.error('Lỗi khi lấy danh sách sinh viên:', error));
  }, []);

  // Xử lý điểm danh sinh viên
  const handleAttendance = (student_id, status) => {
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [student_id]: status,
    }));
  };

  // Gửi thông tin điểm danh về backend
  const handleSubmit = () => {
    const attendanceData = Object.keys(attendance).map((student_id) => ({
      student_id,
      status: attendance[student_id],
    }));

    axios.post('http://localhost:3000/api/students/attendance/bulk', attendanceData)
      .then((response) => {
        setMessage(response.data.message);
        // Cập nhật trạng thái điểm danh cho sinh viên
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            attendance[student.student_id]
              ? { ...student, attendanceStatus: attendance[student.student_id] }
              : student
          )
        );
      })
      .catch((error) => {
        console.error('Lỗi khi gửi thông tin điểm danh:', error);
        setMessage('Không thể gửi thông tin điểm danh. Vui lòng thử lại.');
      });
  };

  return (
    <DashboardLayout>
      <div className="manual-attendance-page">
        <h1>Điểm Danh Sinh Viên</h1>
        {message && <p className="message">{message}</p>}
        <table className="student-table">
          <thead>
            <tr>
              <th>Mã Sinh Viên</th>
              <th>Họ và Tên</th>
              <th>Ngành Học</th>
              <th>Điểm Danh</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.student_id}>
                <td>{student.student_id}</td>
                <td>{student.fullname}</td>
                <td>{student.major}</td>
                <td>
                  <button
                    style={attendance[student.student_id] === 'present' ? { backgroundColor: '#28a745' } : {}}
                    onClick={() => handleAttendance(student.student_id, 'present')}
                  >
                    Có Mặt
                  </button>
                  <button
                    style={attendance[student.student_id] === 'absent' ? { backgroundColor: '#dc3545' } : {}}
                    onClick={() => handleAttendance(student.student_id, 'absent')}
                  >
                    Vắng Mặt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </DashboardLayout>
  );
};

export default ManualAttendancePage;