const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Đảm bảo import đúng đường dẫn

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time:{
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'attendance', // Chỉ định rõ tên bảng
  timestamps: true, // Đảm bảo rằng Sequelize tự động thêm các cột `createdAt` và `updatedAt`
});

module.exports = Attendance;