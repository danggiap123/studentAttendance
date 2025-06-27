
# Đề tài: Ứng dụng điểm danh sinh viên bằng nhận diện khuôn mặt

## 📌 Mô tả dự án
Dự án này xây dựng một **ứng dụng web** sử dụng công nghệ **nhận diện khuôn mặt** để **tự động hóa quá trình điểm danh sinh viên**. Ứng dụng mang lại giải pháp **nhanh chóng**, **chính xác** và **hiệu quả** trong việc quản lý danh sách điểm danh tại các lớp học.


## 🏗️ Thiết kế hệ thống

### 🔹 Kiến trúc tổng quan

#### Giao diện người dùng (Frontend)
- Sử dụng: `HTML`, `CSS`, `JavaScript`, `ReactJS`
- Kèm các thư viện UI trong hệ sinh thái React

#### Máy chủ (Backend)
- Ngôn ngữ: `Node.js`, `Python`
- Sử dụng các thư viện liên quan để xử lý API và AI

#### Cơ sở dữ liệu
- Hệ quản trị CSDL: `MySQL`
- Lưu trữ thông tin sinh viên và điểm danh

---

## 🤖 Thư viện AI sử dụng

### 🔹 Nhận diện khuôn mặt
- [DeepFace](https://github.com/serengil/deepface)  
- [face-api.js](https://github.com/justadudewhohacks/face-api.js)

---

## 📡 Danh sách API

### 1. Lấy danh sách sinh viên
- **Endpoint:** `GET /api/students`  
- **Mô tả:** Trả về danh sách toàn bộ sinh viên  
- **Đầu ra:**
```json
[
  {
    "id": 1,
    "student_id": "20220000",
    "fullname": "Nguyễn Văn A",
    "major": "Kỹ thuật máy tính"
  }
]
```

### 2. Xem thông tin sinh viên
- **Endpoint:** `GET /api/students/profile/:student_id`  
- **Mô tả:** Trả về thông tin chi tiết sinh viên  
- **Đầu ra:**
```json
[
  {
    "student_id": "20220000",
    "fullname": "Nguyễn Văn A",
    "dob": "2004-01-01",
    "school": "Đại học Bách Khoa Hà Nội",
    "major": "Kỹ thuật máy tính",
    "email": "example@example.com"
  }
]
```

### 3. Đăng ký sinh viên
- **Endpoint:** `POST /api/students/register`  
- **Mô tả:** Thêm sinh viên mới  
- **Đầu ra:** Thông tin sinh viên vừa được thêm

### 4. Cập nhật thông tin sinh viên
- **Endpoint:** `PUT /api/students/update/:student_id`  
- **Mô tả:** Sửa thông tin sinh viên  
- **Đầu ra:** Thông tin sinh viên đã được cập nhật

### 5. Tìm sinh viên
- **Endpoint:** `GET /api/students/:student_id`  
- **Mô tả:** Tìm kiếm sinh viên theo mã số  
- **Đầu ra:**
```json
[
  {
    "student_id": "20220000",
    "fullname": "Nguyễn Văn A",
    "major": "Kỹ thuật máy tính"
  }
]
```

### 6. Xuất kết quả điểm danh
- **Endpoint:** `GET /api/students/export`  
- **Mô tả:** Xuất danh sách điểm danh dưới dạng file Excel

### 7. Ghi nhận điểm danh sinh viên
- **Endpoint:** `POST /api/students/attendance`  
- **Mô tả:** Lưu kết quả điểm danh  
- **Đầu ra:**
```json
[
  {
    "student_id": "20220000",
    "Date": "2025-01-01",
    "time": "10:15:50",
    "status": "có mặt"
  }
]
```

### 8. Lấy thông tin điểm danh sinh viên
- **Endpoint:** `GET /api/students/:student_id/attendance`  
- **Mô tả:** Lấy lịch sử điểm danh sinh viên  
- **Đầu ra:** Như trên

### 9. Xóa thông tin sinh viên
- **Endpoint:** `DELETE /api/students/:student_id`  
- **Mô tả:** Xóa sinh viên khỏi hệ thống

---

### 🚀 Cài đặt và triển khai dự án

#### 📦 **Bước 1: Clone dự án**
```bash
git clone https://github.com/danggiap123/studentAttendance/tree/main
```

---

#### 📥 **Bước 2: Cài đặt thư viện cần thiết**

```bash
# Cài đặt thư viện cho frontend
cd frontend
npm install

# Cài đặt thư viện cho backend
cd ../backend
npm install

# Cài đặt thư viện cho dịch vụ Python nhận diện khuôn mặt
cd ../python_services
pip install -r requirements.txt
```

---

#### ▶️ **Bước 3: Khởi chạy ứng dụng**

1. Mở phần mềm **XAMPP** hoặc tương đương và **khởi động MySQL**
2. Khởi chạy từng phần của hệ thống:

```bash
# Khởi động backend
cd backend
npm start

# Khởi động frontend
cd ../frontend
npm start

# Khởi động dịch vụ AI xử lý khuôn mặt
cd ../python_services
python3 app.py
```

---

## 📬 Liên hệ

- **Đặng Nguyên Giáp:** giap.dn225304@sis.hust.edu.vn
