import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import DashboardLayout from '../components/DashboardLayout';
import './AddStudentByFile.css';

const AddStudentByFile = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [existingStudentIds, setExistingStudentIds] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/students')
      .then((response) => {
        const studentIds = response.data.map(student => student.student_id);
        setExistingStudentIds(studentIds);
      })
      .catch((error) => {
        console.error('Lỗi khi lấy danh sách sinh viên:', error);
        setMessage('Không thể lấy danh sách sinh viên. Vui lòng thử lại.');
      });
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const students = worksheet.map((row) => ({
        student_id: row['Mã Sinh Viên'],
        fullname: row['Họ và Tên'],
        dob: row['Ngày Sinh'],
        school: row['Trường'],
        major: row['Ngành Học'],
        email: row['Email'],
        profileImage: row['Ảnh Đại Diện'],
      }));

      setStudentsData(students);
    };
    reader.readAsArrayBuffer(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      setMessage('Vui lòng chọn một file Excel!');
      return;
    }

    const duplicateIds = studentsData.filter(student =>
      existingStudentIds.includes(student.student_id)
    );

    if (duplicateIds.length > 0) {
      setMessage(`Mã số sinh viên đã tồn tại: ${duplicateIds.map(s => s.student_id).join(', ')}`);
      return;
    }

    axios.post('http://localhost:3000/api/students/upload', { students: studentsData })
      .then((response) => {
        setMessage(response.data.message);
        navigate('/student-list');
      })
      .catch((error) => {
        console.error('Lỗi khi tải file:', error);
        setMessage('Không thể tải file. Vui lòng thử lại.');
      });
  };

  return (
    <DashboardLayout>
      <div className="add-file-container">
        <h1>Thêm Sinh Viên Từ File Excel</h1>
        <div className="add-file-upload">
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
          {studentsData.length > 0 && (
            <button onClick={handleUpload}>Tải Lên</button>
          )}
        </div>

        {studentsData.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã Sinh Viên</th>
                <th>Họ và Tên</th>
                <th>Ngày Sinh</th>
                <th>Email</th>
                <th>Ngành</th>
                <th>Trường</th>
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{student.student_id}</td>
                  <td>{student.fullname}</td>
                  <td>{student.dob}</td>
                  <td>{student.email}</td>
                  <td>{student.major}</td>
                  <td>{student.school}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {message && <p className="add-file-message">{message}</p>}
      </div>
    </DashboardLayout>
  );
};

export default AddStudentByFile;
