// userRoutes.js
require("dotenv").config(); // Sử dụng biến môi trường
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");

const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware'); 
const { updateUserProfile } = require('../controllers/userController');
// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Thư mục lưu trữ
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Tạo tên file duy nhất
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Chỉ được upload file ảnh (jpeg, png)"));
    }
    cb(null, true);
  },
});

// Đăng ký
router.post("/register", async (req, res) => {
  const { fullname, email, phone, dob, gender, village, province, district, commune, password } = req.body;

  if (!fullname || !email || !phone || !province || !district || !commune || !password) {
    return res.status(400).json({ message: "Các trường bắt buộc không được để trống!" });
  }

  try {
    // Kiểm tra email tồn tại
    const sqlCheck = "SELECT * FROM user WHERE email = ?";
    db.query(sqlCheck, [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi server khi kiểm tra email" });
      if (result.length > 0) return res.status(400).json({ message: "Email đã tồn tại!" });

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Lưu đường dẫn ảnh (nếu có)
      const profileImage = req.file ? path.join("uploads", "profileImages", req.file.filename) : null;

      // Thêm người dùng vào cơ sở dữ liệu
      const sqlInsert = `
        INSERT INTO user 
        (fullname, email, phone, dob, gender, village, province, district, commune, password, profileImage) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(sqlInsert, [fullname, email, phone, dob, gender, village, province, district, commune, hashedPassword, profileImage], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi server khi thêm người dùng" });
        res.status(201).json({ message: "Đăng ký thành công!" });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// Đăng nhập
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM user WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server!" });
    if (result.length === 0) return res.status(400).json({ message: "Email không tồn tại!" });

    const user = result[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Lỗi server khi kiểm tra mật khẩu!" });
      if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng!" });

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    });
  });
});

// Lấy thông tin user
router.get("/api/user/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "Token không hợp lệ!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const sql = "SELECT * FROM user WHERE id = ?";
    db.query(sql, [userId], (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi server khi truy vấn thông tin người dùng!" });
      if (result.length === 0) return res.status(404).json({ message: "Người dùng không tồn tại!" });

      res.json(result[0]);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Lỗi xác thực token!" });
  }
});
// Cập nhật thông tin người dùng
router.put('/update', authenticateToken, upload.single("profileImage"), async (req, res) => {
  const { fullname, email, phone, dob, gender, village, province, district, commune } = req.body;
  const userId = req.user.id;  // Get user ID from the decoded token (authMiddleware)

  if (!fullname || !email || !phone || !province || !district || !commune ) {
    return res.status(400).json({ message: "Các trường bắt buộc không được để trống!" });
  }

  try {
    // Kiểm tra xem người dùng có ảnh đại diện cũ hay không trong cơ sở dữ liệu
    const userQuery = `SELECT profileImage FROM user WHERE id = ?`;
    db.query(userQuery, [userId], (err, result) => {
      if (err) {
        console.error("Error fetching user data:", err);
        return res.status(500).json({ message: "Lỗi server!" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const oldProfileImage = result[0].profileImage;

      // Nếu có ảnh cũ, xóa ảnh cũ trong thư mục
      if (oldProfileImage) {
        const oldImagePath = path.join(__dirname, 'uploads', oldProfileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Xóa ảnh cũ
        }
      }

      // Nếu có ảnh mới, lấy đường dẫn của ảnh mới
      const profileImage = req.file ? path.join("uploads", req.file.filename) : oldProfileImage;
      console.log("Updated profile image path:", profileImage);
      // Cập nhật thông tin người dùng trong cơ sở dữ liệu
      const sqlUpdate = `
        UPDATE user 
        SET fullname = ?, email = ?, phone = ?, dob = ?, gender = ?, village = ?, province = ?, district = ?, commune = ?, profileImage = ?
        WHERE id = ?
      `;

      db.query(sqlUpdate, [fullname, email, phone, dob, gender, village, province, district, commune, profileImage, userId], (err, result) => {
        if (err) {
          console.error("Error updating user:", err);
          return res.status(500).json({ message: "Lỗi server!" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Thông tin đã được cập nhật thành công!" });
      });
    });
  } catch (error) {
    console.error("Error processing update:", error);
    return res.status(500).json({ message: "Cập nhật thất bại", error: error.message });
  }
});


module.exports = router;
