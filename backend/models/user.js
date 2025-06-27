const {  Sequelize,DataTypes } = require('sequelize');
const sequelize = require('../db'); 
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true,
  },
  province: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  commune: {
    type: DataTypes.STRING, 
    allowNull: false,
  },

  village:{
    type: DataTypes.STRING, 
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
});

module.exports = User;
