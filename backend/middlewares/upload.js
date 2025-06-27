const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình lưu ảnh vào thư mục uploads/profileImage
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profileImage');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = Date.now() + fileExtension;
    cb(null, fileName);
  }
});

// Cấu hình lưu ảnh vào thư mục uploads/student_card
const studentCardStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/student_card');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = Date.now() + fileExtension;
    cb(null, fileName);
  }
});

// Khởi tạo multer với cấu hình trên
const uploadProfileImage = multer({ storage: profileImageStorage });
const uploadStudentCard = multer({ storage: studentCardStorage });

module.exports = {
  uploadProfileImage,
  uploadStudentCard
};
