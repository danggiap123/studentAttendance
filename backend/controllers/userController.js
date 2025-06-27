const User = require('../models/user');  // Model người dùng
//const Student = require('../models/student');  // Model sinh viên
const fs = require('fs');
const csv = require('csv-parser');

exports.registerUser = async (req, res) => {
  const { id,fullname, email, phone, dob, gender, province, district, commune, password, village ,profileImage} = req.body;
  try {
     const hashedPassword = await bcrypt.hash(password, 10);
     console.log('Mật khẩu mã hóa');
     console.log(hashedPassword);

    // Tạo người dùng mới
    const user = await User.create({
      id,
      fullname,
      email,
      phone,
      dob,
      gender,
      province, // Tỉnh
      district, // Huyện
      commune,  // Xã
      village,  // Thôn, xóm
      profileImage: req.file ? req.file.filename : null,
      password: hashedPassword,
    });

    if (user) {
      console.log('Created new user!');
    } else {
      console.log('No user!');
    }

    res.status(201).send("Đăng ký thành công!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Đã xảy ra lỗi!");
  }
};

// Lấy thông tin người dùng
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error });
  }
};

// Cập nhật thông tin người dùng
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullname, phone, province, district, commune,village, gender, dob, email, profileImage } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Cập nhật thông tin
    user.fullname = fullname || user.fullname;
    user.phone = phone || user.phone;
    user.province = province || user.province;
    user.district = district || user.district;
    user.commune = commune || user.commune;
    user.village=village|| user.village;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.email = email || user.email;
    user.profileImage = profileImage || user.profileImage;

    await user.save();
    res.status(200).json({ message: 'Cập nhật thông tin thành công', user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin', error });
  }
};
