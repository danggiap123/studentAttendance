require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { User } = require("./models/user");
const xlsx = require("xlsx");
//const multer = require('multer');
const authRouter = require('./routes/userRoutes'); // Ensure this path is correct
const Student = require('./models/student');
//const Student = require('./models/student');
const app = express();
const studentController = require('./controllers/studentController');
const { profile } = require("console");
// Ensure 'uploads' directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
// Increase the limit for incoming requests
app.use(bodyParser.json({ limit: '50mb' })); // Adjust limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use("/uploads/profileImages", express.static("uploads"));
const saveBase64Image = (base64Data, filePath) => {
  const base64String = base64Data.replace(/^data:image\/jpeg;base64,/, ''); // Loại bỏ phần tiền tố
  const buffer = Buffer.from(base64String, 'base64');
  fs.writeFileSync(filePath, buffer);
};
const db = mysql.createConnection({
  host: "localhost", // Đúng tên host
  user: "root",      // Đúng user
  password: "",      // Đúng password
  database: "project1", // Tên database tồn tại
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err);
    return;
  }
  console.log("Đã kết nối MySQL");
});

// Define the storage for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Directory to store the uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Filename with timestamp
  }
});
// Filter for allowed image types (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only jpeg, jpg, and png are allowed'), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
// Sample middleware to verify token
const authenticateMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = decoded;  // Attach user info to request
    next();
  });
};
// User Registration API
app.post("/api/register", upload.single("profileImage"), async (req, res) => {
  const { fullname, email, phone, dob, gender, village, province, district, commune, password } = req.body;

  if (!fullname || !email || !phone || !province || !district || !commune || !password) {
    return res.status(400).json({ message: "Các trường bắt buộc không được để trống!" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "File upload failed!" });
  }

  try {
    const sqlCheck = "SELECT * FROM user WHERE email = ?";
    db.query(sqlCheck, [email], (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi server!" });
      if (result.length > 0) return res.status(400).json({ message: "Email đã tồn tại!" });

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;

        const sqlInsert = "INSERT INTO user (fullname, email, phone, dob, gender, village, province, district, commune, password, profileImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sqlInsert, [fullname, email, phone, dob, gender, village, province, district, commune, hashedPassword, `uploads/${req.file.filename}`], (err, result) => {
          if (err) throw err;
          res.status(201).json({ message: "Đăng ký thành công!" });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// User Login API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM user WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server!" });
    if (result.length === 0) return res.status(400).json({ message: "Email không tồn tại!" });

    const user = result[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng!" });

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    });
  });
});
app.get('/api/user/profile', authenticateMiddleware, (req, res) => {
  try {
    const userId = req.user.id; // Get user id from decoded token
    const sql = "SELECT * FROM user WHERE id = ?";

    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error('Error fetching user profile:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = result[0];  // Get the first (and only) user from the result
      res.json({
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        village: user.village,
        commune: user.commune,
        district: user.district,
        province: user.province,
        profileImage: user.profileImage,  // Add profile image if available
      });
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add the middleware for uploading files
app.put('/api/user/update', authenticateMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    const { fullname, phone, province, district, commune, village, gender, dob, email } = req.body;
    const userId = req.user.id; // Get user ID from token

    // Check if the user exists in the database
    const sqlCheck = "SELECT * FROM user WHERE id = ?";
    db.query(sqlCheck, [userId], (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi server!" });
      if (result.length === 0) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      const user = result[0]; // Get the user from the result

      // Update user data with the new fields, keeping the existing ones if not provided
      const updatedFullname = fullname || user.fullname;
      const updatedPhone = phone || user.phone;
      const updatedProvince = province || user.province;
      const updatedDistrict = district || user.district;
      const updatedCommune = commune || user.commune;
      const updatedVillage = village || user.village;
      const updatedGender = gender || user.gender;
      const updatedDob = dob || user.dob;
      const updatedEmail = email || user.email;
      let updatedProfileImage = user.profileImage; // Retain the old image if no new image is provided

      // If a new image is uploaded, delete the old image before saving the new one
      if (req.file) {
        const oldImagePath = path.join(__dirname, 'uploads', user.profileImage); // Path to the old image

        // Delete old image if it exists and is valid
        if (user.profileImage && fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image
          console.log(`Deleted old profile image: ${oldImagePath}`);
        }

        updatedProfileImage = `uploads/${req.file.filename}`; // Update the image path
      }

      // SQL query to update user information
      const sqlUpdate = `
        UPDATE user
        SET fullname = ?, phone = ?, province = ?, district = ?, commune = ?, village = ?, gender = ?, dob = ?, email = ?, profileImage = ?
        WHERE id = ?
      `;


      console.log('Old image path:', user.profileImage);
      console.log('New image path:', updatedProfileImage);

      // Execute the update SQL query
      db.query(sqlUpdate, [updatedFullname, updatedPhone, updatedProvince, updatedDistrict, updatedCommune, updatedVillage, updatedGender, updatedDob, updatedEmail, updatedProfileImage, userId], (err, result) => {
        if (err) {
          console.error('Error updating user profile:', err);
          return res.status(500).json({ message: 'Lỗi khi cập nhật thông tin', error: err });
        }
        res.status(200).json({
          message: 'Cập nhật thông tin thành công',
          user: {
            id: userId,
            fullname: updatedFullname,
            email: updatedEmail,
            profileImage: `http://localhost:3000/${updatedProfileImage}` // Return the full URL for the profile image
          }
        });
      });
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin', error });
  }
});
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách sinh viên.' });
  }
});
app.post("/api/students/register", upload.fields([
  { name: 'profileImage' },
  { name: 'imageLeft' },
  { name: 'imageRight' }
]), async (req, res) => {
  const { student_id, fullname, dob, school, major, email } = req.body;

  // Kiểm tra tất cả các trường bắt buộc
  if (!student_id || !fullname || !dob || !school || !major || !email) {
    return res.status(400).json({ message: "Các trường bắt buộc không được để trống!" });
  }

  try {
    // Kiểm tra xem học sinh đã tồn tại chưa
    const studentExists = await Student.findOne({ where: { student_id } });
    if (studentExists) {
      return res.status(400).json({ message: "Mã học sinh đã tồn tại!" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const emailExists = await Student.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: "Email này đã được đăng ký!" });
    }

    // Xử lý ảnh nếu có
    const profileImage = req.files['profileImage'] ? `uploads/${req.files['profileImage'][0].filename}` : null;
    const imageLeft = req.files['imageLeft'] ? `uploads/${req.files['imageLeft'][0].filename}` : null;
    const imageRight = req.files['imageRight'] ? `uploads/${req.files['imageRight'][0].filename}` : null;

    // Prepare SQL insert statement
    const sqlInsert = `
      INSERT INTO students (student_id, fullname, dob, school, major, email, profileImage, imageLeft, imageRight) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    console.log("Form Data: ", {
      student_id,
      fullname,
      dob,
      school,
      major,
      email,
      profileImage,
      imageLeft,
      imageRight
    });

    // Execute the SQL query
    db.query(sqlInsert, [
      student_id, fullname, dob, school, major, email, profileImage, imageLeft, imageRight
    ], (err, result) => {
      if (err) {
        console.error("Error inserting student:", err);
        return res.status(500).json({ message: "Lỗi khi đăng ký học sinh" });
      }

      res.status(201).json({ message: "Đăng ký học sinh thành công!" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});
// Route lấy thông tin sinh viên theo student_id
app.get('/api/students/profile/:student_id', (req, res) => {
  const { student_id } = req.params; // Lấy student_id từ URL params

  console.log("Received student_id:", student_id);  // Log để kiểm tra giá trị student_id

  // Câu lệnh SQL để lấy thông tin sinh viên theo student_id
  const sqlStudent = `
    SELECT student_id, fullname, email, dob, school, major, profileImage
    FROM students
    WHERE student_id = ?
  `;

  // Thực hiện truy vấn SQL để lấy thông tin sinh viên
  db.query(sqlStudent, [student_id], (err, studentResult) => {
    if (err) {
      console.error('Lỗi khi truy vấn cơ sở dữ liệu:', err);
      return res.status(500).json({ message: 'Lỗi server' });
    }

    if (studentResult.length === 0) {
      console.log('Không tìm thấy sinh viên với student_id:', student_id);
      return res.status(404).json({ message: 'Không tìm thấy sinh viên với mã này.' });
    }

    const student = studentResult[0];  // Sinh viên đầu tiên trong kết quả

    // Câu lệnh SQL để lấy thông tin điểm danh từ bảng Attendance
    const sqlAttendance = `
      SELECT date, status
      FROM Attendance
      WHERE student_id = ?
    `;

    // Thực hiện truy vấn SQL để lấy thông tin điểm danh
    db.query(sqlAttendance, [student_id], (err, attendanceResult) => {
      if (err) {
        console.error('Lỗi khi truy vấn cơ sở dữ liệu:', err);
        return res.status(500).json({ message: 'Lỗi server' });
      }

      // Tính số buổi có mặt và số buổi vắng mặt
      const presentCount = attendanceResult.filter(record => record.status === 'có mặt').length;
      const absentCount = attendanceResult.filter(record => record.status === 'vắng mặt').length;

      // Trả về thông tin sinh viên và thông tin điểm danh
      res.status(200).json({
        student_id: student.student_id,
        fullname: student.fullname,
        dob: student.dob,
        school: student.school,
        major: student.major,
        email: student.email,
        profileImage: student.profileImage,
        presentCount,
        absentCount,
        attendanceRecords: attendanceResult,
      });
    });
  });
});
// Route để upload dữ liệu sinh viên từ file Excel
app.post('/api/students/upload', async (req, res) => {
  const studentsData = req.body.students; // Dữ liệu sinh viên từ frontend

  if (!Array.isArray(studentsData) || studentsData.length === 0) {
    return res.status(400).json({ message: 'Không có dữ liệu sinh viên' });
  }

  try {
    // Thêm dữ liệu sinh viên vào cơ sở dữ liệu
    for (let student of studentsData) {
      await Student.create({
        student_id: student.student_id,
        fullname: student.fullname,
        dob: student.dob,
        school: student.school,
        major: student.major,
        profileImage: student.profileImage,
        imageLeft: student.imageLeft,
        imageRight: student.imageRight,
        email: student.email
      });
    }
    res.status(200).json({ message: 'Dữ liệu sinh viên đã được tải lên thành công!' });
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu sinh viên:', error);
    res.status(500).json({ message: 'Lỗi server, không thể thêm dữ liệu sinh viên' });
  }
});
// Route để cập nhật thông tin sinh viên
app.put('/api/students/update/:student_id', upload.fields([
  { name: 'profileImage' },
  { name: 'imageLeft' },
  { name: 'imageRight' }
]), async (req, res) => {
  const { student_id } = req.params;
  const { fullname, dob, school, major, email } = req.body;

  try {
    // Kiểm tra xem sinh viên có tồn tại không
    const studentExists = await Student.findOne({ where: { student_id } });
    if (!studentExists) {
      return res.status(404).json({ message: "Sinh viên không tồn tại!" });
    }

    // Xử lý ảnh nếu có
    const profileImage = req.files && req.files['profileImage'] ? `uploads/${req.files['profileImage'][0].filename}` : studentExists.profileImage;
    const imageLeft = req.files && req.files['imageLeft'] ? `uploads/${req.files['imageLeft'][0].filename}` : studentExists.imageLeft;
    const imageRight = req.files && req.files['imageRight'] ? `uploads/${req.files['imageRight'][0].filename}` : studentExists.imageRight;

    // Cập nhật thông tin sinh viên
    await Student.update({
      fullname,
      dob,
      school,
      major,
      email,
      profileImage,
      imageLeft,
      imageRight
    }, { where: { student_id } });

    res.status(200).json({ message: "Cập nhật thông tin sinh viên thành công!" });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin sinh viên:', error);
    res.status(500).json({ message: "Lỗi server, không thể cập nhật thông tin sinh viên" });
  }
});
// Route để tìm sinh viên theo mã số sinh viên
app.get('/api/students/:student_id', studentController.getStudentById);

// Route để xuất danh sách sinh viên ra file Excel
app.get('/api/students/export', studentController.exportStudentsToExcel);
app.post('/api/students/attendance', studentController.recordAttendance);
app.get('/api/students/:student_id/attendance', studentController.getAttendanceRecords);
app.post('/api/students/attendance/bulk', studentController.bulkAttendance);
app.delete('/api/delete/students/:student_id', studentController.deleteStudent);


//chụp ảnh khi phát hiện khuôn mặt

// Đảm bảo thư mục uploads/captured tồn tại
const capturedDir = path.join(__dirname, '../uploads/captured');
const fsPromises = require('fs').promises;

async function ensureDirectoryExists() {
  try {
    await fsPromises.mkdir(capturedDir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
    throw err;
  }
}


// Hàm để chuyển đổi ngày và giờ thành định dạng hh-mm-ss-dd-mm-yyyy
function getFormattedDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');       // Đảm bảo ngày có 2 chữ số
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Đảm bảo tháng có 2 chữ số (tháng bắt đầu từ 0)
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');    // Đảm bảo giờ có 2 chữ số
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Đảm bảo phút có 2 chữ số
  const seconds = String(date.getSeconds()).padStart(2, '0'); // Đảm bảo giây có 2 chữ số

  return `${hours}-${minutes}-${seconds}-${day}-${month}-${year}`;  // Định dạng hh-mm-ss-dd-mm-yyyy
}

// API nhận chuỗi Base64 và lưu thành ảnh
app.post('/api/capture', (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image là bắt buộc' });
  }

  // Tách phần dữ liệu Base64 và phần tiền tố data:image/png;base64,...
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

  // Tạo tên file tự động từ ngày và giờ hiện tại theo định dạng hh-mm-ss-dd-mm-yyyy
  const formattedDate = getFormattedDate();  // Lấy ngày và giờ hiện tại
  const filePath = path.join(__dirname, 'uploads/captured', `${formattedDate}.png`);  // Tạo tên file theo ngày và giờ

  // Tạo thư mục 'uploads' nếu chưa tồn tại
  if (!fs.existsSync(path.join(__dirname, 'uploads/captured'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads/captured'));
  }

  // Lưu ảnh dưới dạng file
  fs.writeFile(filePath, base64Data, 'base64', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Không thể lưu ảnh' });
    }

    res.status(200).json({ message: 'Ảnh đã được lưu thành công', path: filePath });
  });
});

// Route để upload ảnh thẻ sinh viên
app.post('/api/upload/student_card', (req, res) => {
  const { image } = req.body;
  const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
  const formattedDate = new Date().toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/[:/]/g, '-').replace(/, /g, '--');
  const filePath = path.join(__dirname, 'uploads/student_card', `${formattedDate}.jpeg`);

  fs.writeFile(filePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving image:', err);
      return res.status(500).json({ message: 'Lỗi khi lưu ảnh' });
    }
    res.status(200).json({ message: 'Upload ảnh thành công!', filePath });
  });
});

// Start Server
const port = 3000;
app.listen(port, () => console.log(`Server chạy tại http://localhost:${port}`));
