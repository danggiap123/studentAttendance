const { Sequelize } = require('sequelize');
require('dotenv').config(); // Để đọc biến môi trường từ .env

// Thiết lập kết nối MySQL
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT||3306,
  logging: false, // Tắt log SQL (bật nếu cần debug)
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Kết nối cơ sở dữ liệu thành công!');
  })
  .catch((error) => {
    console.error('Không thể kết nối đến cơ sở dữ liệu:', error);
  });

module.exports = sequelize;
