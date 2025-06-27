const { DataTypes } = require('sequelize');
const sequelize = require('../db'); 
const e = require('express');
//const Class = require('./class'); 

const Student = sequelize.define('Students', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profileImage: {
    type: DataTypes.STRING,
  },
  imageLeft: {
    type: DataTypes.STRING,
  },
  imageRight: {
    type: DataTypes.STRING,
  },
  dob: {
    type: DataTypes.DATEONLY,
  },
  school: {
    type: DataTypes.STRING,
  },
  major: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  presentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  absentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  attendanceRecords: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
});



module.exports = Student;
