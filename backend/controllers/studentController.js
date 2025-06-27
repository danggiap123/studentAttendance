const XLSX = require('xlsx');
const XLSXPopulate = require('xlsx-populate');
const Student = require('../models/student'); // Import model Student
const Attendance = require('../models/Attendance'); // Import model Attendance
const fs = require('fs');
const path = require('path');
const db = require('../db');
//const xlsx = require('xlsx');
// Lấy danh sách sinh viên từ cơ sở dữ liệu
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách sinh viên.' });
  }
};
exports.uploadStudents = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const students = sheetData.map((row) => ({
      student_id: row['Student ID'],
      fullname: row['Full Name'],
      dob: row['Date of Birth'],
      school: row['School'],
      major: row['Major'],
    }));

    await Student.bulkCreate(students);
    res.status(200).json({ message: 'Tải lên danh sách sinh viên thành công.' });
  } catch (error) {
    console.error('Lỗi khi tải lên danh sách sinh viên:', error);
    res.status(500).json({ error: 'Không thể tải lên danh sách sinh viên.' });
  }
};
exports.registerStudent = async (req, res) => {
  try {
    const { student_id, fullname, dob, school, major } = req.body;

    const newStudent = await Student.create({
      student_id,
      fullname,
      dob,
      school,
      major,
      profileImage: req.files.profileImage ? req.files.profileImage[0].filename : null,
      imageLeft: req.files.imageLeft ? req.files.imageLeft[0].filename : null,
      imageRight: req.files.imageRight ? req.files.imageRight[0].filename : null,
    });

    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Lỗi khi thêm sinh viên:', error);
    res.status(500).json({ message: 'Không thể thêm sinh viên. Vui lòng thử lại.' });
  }
}
// Controller: Lấy thông tin chi tiết của sinh viên theo student_id
exports.getStudentById = async (req, res) => {
  const { student_id } = req.params;  // Lấy student_id từ URL

  try {
    // Tìm sinh viên theo student_id trong cơ sở dữ liệu
    const student = await Student.findOne({ where: { student_id } });

    if (!student) {
      console.log('Không tìm thấy sinh viên với student_id:', student_id);  // Log lỗi để debug
      return res.status(404).json({ message: 'Không tìm thấy sinh viên với mã này.' });
    }

    // Lấy thông tin điểm danh từ bảng Attendance
    const attendanceRecords = await Attendance.findAll({ where: { student_id } });

    // Tính số buổi có mặt và số buổi vắng mặt
    const presentCount = attendanceRecords.filter(record => record.status === 'có mặt').length;
    const absentCount = attendanceRecords.filter(record => record.status === 'vắng mặt').length;

    res.status(200).json({
      student_id: student.student_id,
      fullname: student.fullname,
      dob: student.dob,
      school: student.school,
      major: student.major,
      profileImage: student.profileImage,
      email: student.email,
      presentCount,
      absentCount,
      attendanceRecords,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sinh viên:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin sinh viên.' });
  }
};


// API tải file Excel và thêm dữ liệu vào cơ sở dữ liệu
// Tải file Excel và lưu danh sách sinh viên vào cơ sở dữ liệu
// Controller: Thêm sinh viên từ file Excel
exports.uploadStudentsFromFile = async (req, res) => {
  const studentsData = req.body.students; // Dữ liệu sinh viên từ frontend

  if (!Array.isArray(studentsData) || studentsData.length === 0) {
    return res.status(400).json({ message: 'Không có dữ liệu sinh viên' });
  }

  try {
    // Kiểm tra mã số sinh viên trước khi thêm vào cơ sở dữ liệu
    for (let student of studentsData) {
      const studentExists = await Student.findOne({ where: { student_id: student.student_id } });
      if (studentExists) {
        return res.status(400).json({ message: `Mã sinh viên ${student.student_id} đã tồn tại!` });
      }
    }

    // Thêm dữ liệu sinh viên vào cơ sở dữ liệu
    for (let student of studentsData) {
      await Student.create({
        student_id: student.student_id,
        fullname: student.fullname,
        dob: student.dob,
        school: student.school,
        major: student.major,
        email: student.email,
        profileImage: student.profileImage,
        imageLeft: student.imageLeft,
        imageRight: student.imageRight,
      });
    }
    res.status(200).json({ message: 'Dữ liệu sinh viên đã được tải lên thành công!' });
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu sinh viên:', error);
    res.status(500).json({ message: 'Lỗi server, không thể thêm dữ liệu sinh viên' });
  }
};


// Controller: Xuất danh sách sinh viên ra file Excel
exports.exportStudentsToExcel = async (req, res) => {
  try {
    // Lấy danh sách sinh viên
    const students = await Student.findAll({
      attributes: ['student_id', 'fullname', 'dob', 'major', 'presentCount', 'absentCount', 'profileImage']
    });

    // Lấy toàn bộ bản ghi điểm danh
    const attendanceRecords = await Attendance.findAll();

    // Tạo workbook Excel
    const workbook = await XLSXPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0);

    // Tạo tiêu đề cột
    const headers = [
      'Mã Sinh Viên',
      'Họ và Tên',
      'Ngày Sinh',
      'Ngành Học',
      'Số Buổi Có Mặt',
      'Số Buổi Vắng',
      'Ảnh Đại Diện (Base64)',
    ];

    const uniqueDates = [...new Set(attendanceRecords.map(r => r.date))].sort();
    uniqueDates.forEach(date => {
      headers.push(date);
    });

    headers.forEach((header, index) => {
      sheet.cell(1, index + 1).value(header);
    });

    // Ghi dữ liệu sinh viên
    students.forEach((student, rowIndex) => {
      const row = rowIndex + 2;

      sheet.cell(row, 1).value(student.student_id);
      sheet.cell(row, 2).value(student.fullname);
      sheet.cell(row, 3).value(student.dob);
      sheet.cell(row, 4).value(student.major);
      sheet.cell(row, 5).value(student.presentCount);
      sheet.cell(row, 6).value(student.absentCount);

      // Chuyển ảnh sang base64
      const imagePath = path.join(__dirname, '..', 'uploads', student.profileImage || '');
      let base64String = 'Không có ảnh';
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        base64String = imageBuffer.toString('base64');
      }

      sheet.cell(row, 7).value(base64String);

      // Ghi dữ liệu điểm danh theo ngày
      uniqueDates.forEach((date, colIndex) => {
        const record = attendanceRecords.find(
          r => r.student_id === student.student_id && r.date === date
        );
        sheet.cell(row, colIndex + 8).value(record ? record.status : 'N/A');
      });
    });

    // Ghi workbook ra buffer
    const buffer = await workbook.outputAsync();

    // Gửi file cho client
    res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-sinh-vien.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Lỗi khi xuất file Excel:', error);
    res.status(500).json({ message: 'Không thể xuất file. Vui lòng thử lại.' });
  }
};



// const { Student } = require('../models/student'); // Đảm bảo import đúng model Student
// const Attendance = require('../models/attendance'); // Import model Attendance

// Controller: Ghi nhận điểm danh sinh viên
exports.recordAttendance = async (req, res) => {
  try {
    const { student_id, status } = req.body;

    // Tìm sinh viên theo student_id
    const student = await Student.findOne({ where: { student_id } });
    if (!student) return res.status(404).json({ error: "Sinh viên không tồn tại" });

    // Tạo bản ghi điểm danh
    const date = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại
    const time = new Date().toTimeString().split(' ')[0]; // Lấy thời gian hiện tại (HH:MM:SS)

    // Lưu thông tin điểm danh vào bảng Attendance
    await Attendance.create({
      student_id,
      date,
      time,
      status: status === 'present' ? 'có mặt' : 'vắng mặt',
    });

    // Cập nhật số buổi có mặt và số buổi vắng mặt
    if (status === 'present') {
      student.presentCount += 1;
    } else if (status === 'absent') {
      student.absentCount += 1;
    }

    await student.save();

    res.status(200).json({ message: "Điểm danh thành công", student });
  } catch (error) {
    console.error('Lỗi khi ghi nhận điểm danh:', error);
    res.status(500).json({ error: "Lỗi khi ghi nhận điểm danh" });
  }
};

// Controller: Lấy thông tin điểm danh của sinh viên
exports.getAttendanceRecords = async (req, res) => {
  const { student_id } = req.params;  // Lấy student_id từ URL

  try {
    // Tìm sinh viên theo student_id trong cơ sở dữ liệu
    const student = await Student.findOne({ where: { student_id } });

    if (!student) {
      console.log('Không tìm thấy sinh viên với student_id:', student_id);  // Log lỗi để debug
      return res.status(404).json({ message: 'Không tìm thấy sinh viên với mã này.' });
    }

    // Lấy thông tin điểm danh từ bảng Attendance
    const attendanceRecords = await Attendance.findAll({ where: { student_id } });

    res.status(200).json({
      student_id: student.student_id,
      fullname: student.fullname,
      attendanceRecords,
      presentCount: student.presentCount,
      absentCount: student.absentCount,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin điểm danh sinh viên:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin điểm danh sinh viên.' });
  }
};
// Controller: Xử lý điểm danh hàng loạt
exports.bulkAttendance = async (req, res) => {
  try {
    let attendanceData = req.body;
    // Kiểm tra xem attendanceData có phải là một mảng không
    if (!Array.isArray(attendanceData)) {
      // Nếu không phải là mảng, chuyển thành mảng
      attendanceData = [attendanceData];
    }
    // Lưu thông tin điểm danh vào cơ sở dữ liệu
    await Promise.all(attendanceData.map(async (record) => {
      const { student_id, status } = record;
      const date = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại
      const time = new Date().toTimeString().split(' ')[0]; // Lấy thời gian hiện tại (HH:MM:SS)

      await Attendance.create({
        student_id,
        date,
        time,
        status: status === 'present' ? 'có mặt' : 'vắng mặt',
      });

      // Cập nhật số buổi có mặt và số buổi vắng mặt
      const student = await Student.findOne({ where: { student_id } });
      if (status === 'present') {
        student.presentCount += 1;
      } else if (status === 'absent') {
        student.absentCount += 1;
      }
      await student.save();
    }));

    res.status(200).json({ message: 'Điểm danh thành công!' });
  } catch (error) {
    console.error('Lỗi khi điểm danh hàng loạt:', error);
    res.status(500).json({ message: 'Không thể điểm danh. Vui lòng thử lại.' });
  }
};

// Controller: Xóa sinh viên và toàn bộ thông tin liên quan
exports.deleteStudent = async (req, res) => {
  const { student_id } = req.params;

  try {
    // Xóa thông tin điểm danh của sinh viên
    await Attendance.destroy({ where: { student_id } });

    // Xóa thông tin sinh viên
    await Student.destroy({ where: { student_id } });

    res.status(200).json({ message: 'Xóa sinh viên thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa sinh viên:', error);
    res.status(500).json({ message: 'Không thể xóa sinh viên. Vui lòng thử lại.' });
  }
};
