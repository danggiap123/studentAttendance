from flask import Flask, request, jsonify
import os
import base64
from PIL import Image
from io import BytesIO
from deepface import DeepFace
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)


# Hàm tìm kiếm khuôn mặt trong tất cả các thư mục con
def find_face_in_all_folders(img_path, db_path, threshold=0.4):
    # Duyệt qua tất cả các thư mục con trong thư mục db_path
    for folder_name in os.listdir(db_path):
        folder_path = os.path.join(db_path, folder_name)
        if os.path.isdir(folder_path):  # Kiểm tra nếu là thư mục con
            print(f"Checking folder: {folder_name}")

            # Kiểm tra nếu thư mục con không rỗng (có ảnh)
            if not any(fname.endswith(('.jpg', '.jpeg', '.png')) for fname in os.listdir(folder_path)):
                print(f"Folder {folder_name} is empty or does not contain valid image files.")
                continue  # Nếu thư mục trống, chuyển sang thư mục khác

            # Tìm kiếm khuôn mặt trong thư mục con
            try:
                result = DeepFace.find(
                    img_path=img_path,
                    db_path=folder_path,  # Chỉ tìm trong thư mục con
                    model_name="Facenet",  # Hoặc bạn có thể dùng các model khác
                    enforce_detection=False,
                    threshold=threshold,  # Sử dụng threshold để lọc kết quả
                    anti_spoofing=False
                )

                # Kiểm tra nếu kết quả là danh sách các DataFrame
                if isinstance(result, list) and all(isinstance(df, pd.DataFrame) for df in result):
                    min_distance = float('inf')  # Khởi tạo khoảng cách nhỏ nhất
                    for df in result:
                        if 'distance' in df.columns:
                            distances = df['distance'].tolist()
                            # Tìm khoảng cách nhỏ nhất trong các kết quả
                            min_distance = min(distances, default=min_distance)

                    print(f"Minimum distance in folder {folder_name}: {min_distance}")

                    # So sánh với threshold
                    if min_distance <= threshold:
                        print(f"Match found in folder: {folder_name} with distance: {min_distance}")
                        return folder_name  # Trả về tên thư mục con đã tìm thấy

                else:
                    print(f"No valid face found in folder {folder_name}")
            except Exception as e:
                print(f"Error in finding face in folder {folder_name}: {str(e)}")
                continue  # Nếu có lỗi trong việc tìm khuôn mặt, chuyển sang thư mục khác

    return None  # Nếu không tìm thấy khuôn mặt trong bất kỳ thư mục con nào


# Route API để nhận diện khuôn mặt
@app.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()  # Nhận JSON từ POST request

    if 'image' not in data:
        print("Error: No image provided")
        return jsonify({"error": "No image provided",
                        "code": "2"}), 400

    img_base64 = data['image']

    try:
        print("Decoding base64 image...")

        # Kiểm tra xem base64 có chứa phần "data:image" không
        if not img_base64.startswith("data:image"):
            print("Error: Base64 string does not contain 'data:image' prefix")
            return jsonify({"error": "Invalid base64 string",
                            "code": "2"}), 400

        # Giải mã base64 thành ảnh
        img_data = base64.b64decode(img_base64.split(",")[1])  # Lấy phần sau dấu "," của chuỗi base64
        img = Image.open(BytesIO(img_data))
        print("Image decoded successfully.")

        # Lưu ảnh tạm thời
        img_path = os.path.join('uploads', 'temp_image.jpg')
        img.save(img_path)
        print(f"Image saved temporarily at {img_path}")

        # Tìm kiếm trong tất cả các thư mục con trong face_databases
        db_folder = 'face_databases'
        matched_folder = find_face_in_all_folders(img_path, db_folder, threshold=0.15)

        if matched_folder:
            print(f"Person found in folder: {matched_folder}")
            return jsonify({"mssv": f"{matched_folder}",
                            "code": "0"}), 200
        else:
            print("No person found in the database.")
            return jsonify({"message": "No person found in the database.",
                            "Code": "1"}), 404

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({"error": f"Error processing image: {str(e)}"}), 400


# Chạy Flask app
if __name__ == '__main__':
    # Tạo folder lưu ảnh nếu chưa có
    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    if not os.path.exists('face_databases'):
        os.makedirs('face_databases')

    app.run(debug=True)
