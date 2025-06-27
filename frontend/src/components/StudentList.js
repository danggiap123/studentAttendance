import React, { useEffect, useState } from 'react';
import '../App.css';
function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/getStudents')  // Thay URL cho đúng
      .then(response => response.json())
      .then(data => setStudents(data));
  }, []);

  return (
    <div>
      <h1>Danh Sách Sinh Viên</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
