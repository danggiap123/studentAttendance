import React, { useState, useEffect } from "react";
import Select from "react-select";
import data from "./data.json"; // Dữ liệu tỉnh, huyện, xã
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng
import './updateProfile.css';
import axios from 'axios'; // Import axios để gửi yêu cầu HTTP
import DashboardLayout from '../components/DashboardLayout';

function UpdateProfile() {
  const navigate = useNavigate(); // Khai báo hook navigate

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [village, setVillage] = useState("");

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null); // Separate state for file 

  useEffect(() => {
    const provincesArray = Object.keys(data).map((key) => ({
      value: key,
      label: data[key].name_with_type,
    }));
    setProvinces(provincesArray);

    // Load user data from API để có thông tin mới nhất
    const loadUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3000/api/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const user = response.data;
          setFullname(user.fullname || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setDob(user.dob || "");
          setGender(user.gender || "");
          setVillage(user.village || "");

          // Hiển thị ảnh hiện tại nếu có
          if (user.profileImage) {
            setProfileImage(`http://localhost:3000/${user.profileImage}?timestamp=${new Date().getTime()}`);
          }

          // Set address information (Province, District, Commune)
          console.log('User data from API:', user); // Debug log

          // Xử lý địa chỉ - có thể user.address là string hoặc object
          let addressData = null;
          if (typeof user.address === 'string') {
            // Nếu address là string, thử parse JSON
            try {
              addressData = JSON.parse(user.address);
            } catch (e) {
              console.log('Address is string, not JSON:', user.address);
            }
          } else if (typeof user.address === 'object') {
            // Nếu address đã là object
            addressData = user.address;
          }

          // Hoặc kiểm tra xem có province, district, commune riêng lẻ không
          const provinceValue = addressData?.province || user.province || "";
          const districtValue = addressData?.district || user.district || "";
          const communeValue = addressData?.commune || user.commune || "";

          console.log('Address values:', { provinceValue, districtValue, communeValue });

          if (provinceValue) {
            const province = provincesArray.find(p => p.label === provinceValue);
            setSelectedProvince(province || null);

            if (province && data[province.value]) {
              const districtsArray = Object.keys(data[province.value]["quan-huyen"]).map((key) => ({
                value: key,
                label: data[province.value]["quan-huyen"][key].name_with_type,
              }));
              setDistricts(districtsArray);

              if (districtValue) {
                const district = districtsArray.find(d => d.label === districtValue);
                setSelectedDistrict(district || null);

                if (district && data[province.value]["quan-huyen"][district.value]) {
                  const communesArray = Object.keys(data[province.value]["quan-huyen"][district.value]["xa-phuong"]).map((key) => ({
                    value: key,
                    label: data[province.value]["quan-huyen"][district.value]["xa-phuong"][key].name_with_type,
                  }));
                  setCommunes(communesArray);

                  if (communeValue) {
                    const commune = communesArray.find(w => w.label === communeValue);
                    setSelectedCommune(commune || null);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback to localStorage if API fails
          const user = JSON.parse(localStorage.getItem('user'));
          if (user) {
            console.log('User data from localStorage:', user); // Debug log

            setFullname(user.fullname || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
            setDob(user.dob || "");
            setGender(user.gender || "");
            setVillage(user.village || "");
            if (user.profileImage) {
              setProfileImage(`http://localhost:3000/${user.profileImage}?timestamp=${new Date().getTime()}`);
            }

            // Xử lý địa chỉ từ localStorage cũng như API
            let addressData = null;
            if (typeof user.address === 'string') {
              try {
                addressData = JSON.parse(user.address);
              } catch (e) {
                console.log('Address is string, not JSON:', user.address);
              }
            } else if (typeof user.address === 'object') {
              addressData = user.address;
            }

            const provinceValue = addressData?.province || user.province || "";
            const districtValue = addressData?.district || user.district || "";
            const communeValue = addressData?.commune || user.commune || "";

            console.log('Address values from localStorage:', { provinceValue, districtValue, communeValue });

            if (provinceValue) {
              const province = provincesArray.find(p => p.label === provinceValue);
              setSelectedProvince(province || null);

              if (province && data[province.value]) {
                const districtsArray = Object.keys(data[province.value]["quan-huyen"]).map((key) => ({
                  value: key,
                  label: data[province.value]["quan-huyen"][key].name_with_type,
                }));
                setDistricts(districtsArray);

                if (districtValue) {
                  const district = districtsArray.find(d => d.label === districtValue);
                  setSelectedDistrict(district || null);

                  if (district && data[province.value]["quan-huyen"][district.value]) {
                    const communesArray = Object.keys(data[province.value]["quan-huyen"][district.value]["xa-phuong"]).map((key) => ({
                      value: key,
                      label: data[province.value]["quan-huyen"][district.value]["xa-phuong"][key].name_with_type,
                    }));
                    setCommunes(communesArray);

                    if (communeValue) {
                      const commune = communesArray.find(w => w.label === communeValue);
                      setSelectedCommune(commune || null);
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    loadUserData();
  }, []);

  const handleProvinceChange = (selectedOption) => {
    setSelectedProvince(selectedOption);
    setSelectedDistrict(null);
    setSelectedCommune(null);
    setVillage("");

    const selectedProvinceData = data[selectedOption.value];
    if (selectedProvinceData) {
      const districtsArray = Object.keys(selectedProvinceData["quan-huyen"]).map((key) => ({
        value: key,
        label: selectedProvinceData["quan-huyen"][key].name_with_type,
      }));
      setDistricts(districtsArray);
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    setSelectedCommune(null);
    setVillage("");

    const selectedDistrictData = data[selectedProvince.value]["quan-huyen"][selectedOption.value];
    if (selectedDistrictData) {
      const communesArray = Object.keys(selectedDistrictData["xa-phuong"]).map((key) => ({
        value: key,
        label: selectedDistrictData["xa-phuong"][key].name_with_type,
      }));
      setCommunes(communesArray);
    } else {
      setCommunes([]);
    }
  };

  const handleCommuneChange = (selectedOption) => {
    setSelectedCommune(selectedOption);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Hiển thị preview ảnh mới
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Lưu file để upload
      setProfileImageFile(file);
    }
  };

  // Define the updateProfile function here
  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/user/update', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Cập nhật thành công:', response.data);
      // Cập nhật lại thông tin người dùng trong localStorage
      localStorage.setItem('user', JSON.stringify(formData));
    } catch (error) {
      console.error('Cập nhật thất bại:', error.response?.data || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('fullname', fullname);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('dob', dob);
    formData.append('gender', gender);
    if (profileImageFile) {
      formData.append('profileImage', profileImageFile); // Gửi ảnh mới lên server
    }
    formData.append('province', selectedProvince?.label);
    formData.append('district', selectedDistrict?.label);
    formData.append('commune', selectedCommune?.label);
    formData.append('village', village);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/user/update', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Cập nhật thành công:', response.data);

      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileImage(`http://localhost:3000/uploads/${updatedUser.profileImage}?timestamp=${new Date().getTime()}`); // Cập nhật URL ảnh
      navigate('/profile');
    } catch (error) {
      console.error('Cập nhật thất bại:', error.response?.data || error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="update-profile-container">
        <h1>Cập nhật thông tin cá nhân</h1>
        <form onSubmit={handleSubmit} className="update-profile-form">
          <div className="form-group">
            <label htmlFor="profileImage">Ảnh đại diện hiện tại:</label>
            {profileImage && <img src={profileImage} alt="Avatar Preview" className="avatar-preview" />}
            <label htmlFor="profileImage">Chọn ảnh mới (nếu muốn thay đổi):</label>
            <input
              type="file"
              id="profileImage"
              onChange={handleProfileImageChange}
              accept="image/*"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullname">Họ và tên:</label>
            <input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dob">Ngày sinh:</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Giới tính:</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="province">Tỉnh/Thành phố:</label>
            <Select
              id="province"
              value={selectedProvince}
              onChange={handleProvinceChange}
              options={provinces}
            />
          </div>

          <div className="form-group">
            <label htmlFor="district">Quận/Huyện:</label>
            <Select
              id="district"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              options={districts}
            />
          </div>

          <div className="form-group">
            <label htmlFor="commune">Xã/Phường:</label>
            <Select
              id="commune"
              value={selectedCommune}
              onChange={handleCommuneChange}
              options={communes}
            />
          </div>
          <div className="form-group">
            <label htmlFor="village">Thôn/Xóm:</label>
            <input
              type="text"
              id="village"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="Nhập thôn/xóm"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="update-profile-btn">Cập nhật thông tin</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default UpdateProfile;