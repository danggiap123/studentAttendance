import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './StudentsListpages.css';

// ... phần import giữ nguyên

function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/students');
        const studentsData = response.data;

        const studentsWithAttendance = await Promise.all(
          studentsData.map(async (student) => {
            try {
              const attendanceResponse = await axios.get(
                `http://localhost:3000/api/students/${student.student_id}/attendance`
              );
              return {
                ...student,
                attendanceRecords: attendanceResponse.data.attendanceRecords || [],
                presentCount: attendanceResponse.data.presentCount || 0,
                absentCount: attendanceResponse.data.absentCount || 0,
              };
            } catch (error) {
              return {
                ...student,
                attendanceRecords: [],
                presentCount: 0,
                absentCount: 0,
              };
            }
          })
        );

        setStudents(studentsWithAttendance);
      } catch (error) {
        console.error('Error fetching students list:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    if (students.length === 0) {
      alert('No students to export!');
      return;
    }

    const studentsFiltered = students.map((student, index) => {
      const attendanceInfo = student.attendanceRecords || [];
      const studentData = {
        STT: index + 1,
        'Mã Sinh Viên': student.student_id,
        'Họ và Tên': student.fullname,
        'Ngày Sinh': student.dob.split('T')[0],
        'Email': student.email,
        'Trường': student.school,
        'Ngành Học': student.major,
        'Số Buổi Có Mặt': student.presentCount,
        'Số Buổi Vắng': student.absentCount,
      };

      attendanceInfo.forEach((record) => {
        const attendanceKey = `${record.date} (${record.time})`;
        studentData[attendanceKey] = record.status;
      });

      return studentData;
    });

    const ws = XLSX.utils.json_to_sheet(studentsFiltered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Sinh Viên');

    XLSX.writeFile(wb, 'DanhSachSinhVien.xlsx');
  };

  return (
    <DashboardLayout>
      <div className="student-list-page">
        <h1>Danh Sách Sinh Viên</h1>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <p className="student-count">
          Tổng số sinh viên: <strong>{filteredStudents.length}</strong>
        </p>
        <div className="export-btn">
          <button onClick={handleExportExcel}>Xuất File Excel</button>
        </div>

        <div className="add-student-btn">
          <Link to="/add-student">
            <button>Thêm Sinh Viên</button>
          </Link>
        </div>

        <div className="student-list">
          {filteredStudents.map((student) => {
            const avatarUrl = student.profileImage
              ? `http://localhost:3000/${student.profileImage}`
              : 'https://via.placeholder.com/100';

            return (
              <div key={student.student_id} className="student-card">
                <img src={avatarUrl} alt="Avatar" className="student-avatar" />
                <h3>{student.fullname}</h3>
                <p>Mã sinh viên: {student.student_id}</p>
                <p>Ngành học: {student.major || 'N/A'}</p>
                <Link to={`/students/profile/${student.student_id}`}>
                  <button className="view-profile-btn">Xem Hồ Sơ</button>
                </Link>
              </div>
            );
          })}
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </DashboardLayout>
  );
}

export default StudentListPage;
