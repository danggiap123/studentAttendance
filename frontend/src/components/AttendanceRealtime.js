import { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom'; // Link for navigation

const user = JSON.parse(localStorage.getItem('user'));  // Get user info from localStorage
const avatarUrl = user?.avatar || '/path/to/default-avatar.jpg';  // Use default avatar if none exists

function AttendanceRealtime() {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [faceDetected, setFaceDetected] = useState(false);
    const [webcamActive, setWebcamActive] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null); // State for student info
    const [isFaceNotFound, setIsFaceNotFound] = useState(false); // State for face not found pop-up
    const [attendedStudents, setAttendedStudents] = useState([]); // State for attended students list
    let detectionInterval = useRef(null);
    let countdownInterval = useRef(null);

    useEffect(() => {
        loadModels();
        videoRef.current.addEventListener('loadeddata', () => {
            console.log('Video loaded, starting face detection');
            startFaceDetection();
        });
        return () => {
            clearResources();
        };
    }, []);

    const loadModels = async () => {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        console.log('Models loaded successfully');
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                videoRef.current.srcObject = currentStream;
                setWebcamActive(true);
                startFaceDetection();
            })
            .catch((err) => {
                console.error(err);
                setWebcamActive(false);
            });
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            let stream = videoRef.current.srcObject;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setWebcamActive(false);
        clearResources();
    };

    const clearResources = () => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        if (detectionInterval.current) {
            clearInterval(detectionInterval.current);
            detectionInterval.current = null;
        }
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
        }
        setCountdown(null);
        setFaceDetected(false);
        setIsWaiting(false);
    };

    const startFaceDetection = () => {
        if (detectionInterval.current) clearInterval(detectionInterval.current);

        detectionInterval.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                const detections = await faceapi.detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                );

                canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
                faceapi.matchDimensions(canvasRef.current, { width: 940, height: 650 });

                const resized = faceapi.resizeResults(detections, { width: 940, height: 650 });
                faceapi.draw.drawDetections(canvasRef.current, resized);

                if (detections.length > 0 && !faceDetected && !isWaiting) {
                    setFaceDetected(true);
                    startCountdown();
                } else if (detections.length === 0 && !isWaiting) {
                    setFaceDetected(false);
                    resetCountdown();
                }
            }
        }, 1000);
    };

    const startCountdown = () => {
        if (countdownInterval.current || countdown !== null || isWaiting) return;

        let count = 3;
        setCountdown(count);

        countdownInterval.current = setInterval(() => {
            count -= 1;
            setCountdown(count);

            if (count === 0) {
                clearInterval(countdownInterval.current);
                countdownInterval.current = null;
                setCountdown(null);
                captureAndSendImage();
            }
        }, 1000);
    };

    const resetCountdown = () => {
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
        }
        setCountdown(null);
    };

    const captureAndSendImage = () => {
        setIsWaiting(true); // Set waiting state when starting capture

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');

        const base64Image = dataUrl.split(',')[1];

        fetch('http://127.0.0.1:5000/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: `data:image/jpeg;base64,${base64Image}` }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Server response:', data);

                if (data.code === "0") {
                    const studentId = data.mssv; // Lấy studentId từ response

                    return fetch(`http://localhost:3000/api/students/profile/${studentId}`)
                        .then((response) => response.json())
                        .then((studentData) => {
                            const profileImageUrl = studentData.profileImage
                                ? `http://localhost:3000/${studentData.profileImage}`
                                : '/path/to/default-avatar.jpg';

                            const newStudentInfo = {
                                studentId: studentData.student_id,
                                fullname: studentData.fullname,
                                dob: studentData.dob,
                                email: studentData.email,
                                school: studentData.school,
                                major: studentData.major,
                                profileImage: profileImageUrl,
                                attendanceTime: new Date().toLocaleString('vi-VN')
                            };

                            setStudentInfo(newStudentInfo);

                            // Check if student is already in the attendance list
                            const isAlreadyAttended = attendedStudents.some(
                                student => student.studentId === newStudentInfo.studentId
                            );

                            if (!isAlreadyAttended) {
                                setAttendedStudents(prev => [...prev, newStudentInfo]);

                                // Ghi điểm danh vào database sử dụng API có sẵn
                                const attendanceData = [{
                                    student_id: studentData.student_id,
                                    status: 'present'
                                }];

                                fetch('http://localhost:3000/api/students/attendance/bulk', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(attendanceData),
                                })
                                    .then(response => response.json())
                                    .then(result => {
                                        console.log('Attendance recorded successfully:', result);
                                    })
                                    .catch(error => {
                                        console.error('Error recording attendance:', error);
                                    });
                            } else {
                                console.log('Student already attended today');
                            }

                            // Reset states after successful attendance
                            setTimeout(() => {
                                setFaceDetected(false);
                                setIsWaiting(false);
                            }, 2000); // Wait 2 seconds before allowing next detection
                        });
                } else {
                    setIsFaceNotFound(true);
                    setTimeout(() => {
                        setIsFaceNotFound(false);
                        setFaceDetected(false);
                        setIsWaiting(false);
                    }, 3000); // Show error for 3 seconds then reset
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                // Reset states on error
                setTimeout(() => {
                    setFaceDetected(false);
                    setIsWaiting(false);
                }, 3000);
            });
    };

    return (
        <div className="container text-center mt-3">
            <h1 className="mb-0 mt-0">Điểm danh bằng khuôn mặt</h1>
            <div className="row justify-content-center mt-3">
                <div className="col-md-6">
                    <div className="video-container position-relative border rounded shadow">
                        <video
                            crossOrigin="anonymous"
                            ref={videoRef}
                            autoPlay
                            className="w-100 rounded"
                            style={{ maxHeight: '400px' }}
                        ></video>
                        <canvas
                            ref={canvasRef}
                            className="position-absolute top-0 start-0 w-100 h-100"
                        />
                    </div>
                </div>

                {/* Phần thông tin sinh viên sẽ chỉ hiển thị sau khi điểm danh */}
                {studentInfo && (
                    <div className="col-md-4 mt-3">
                        <div className="student-info-container border p-3 rounded shadow">
                            <div className="student-info text-left">
                                <h4>{studentInfo.fullname}</h4>
                                <p><strong>MSSV:</strong> {studentInfo.studentId}</p>
                                <p><strong>Ngày sinh:</strong> {new Date(studentInfo.dob).toLocaleDateString('en-GB')}</p>
                                <img
                                    src={studentInfo.profileImage}
                                    alt="Student Avatar"
                                    className="img-fluid rounded-circle"
                                    style={{ width: '200px', height: '200px' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pop-up thông báo không tìm thấy khuôn mặt */}
            {isFaceNotFound && (
                <div className="alert alert-danger text-center mt-3">
                    <strong>Không tìm thấy khuôn mặt trong cơ sở dữ liệu.</strong>
                </div>
            )}

            <div className="mt-3">
                <button
                    className={`btn btn-lg ${webcamActive ? 'btn-danger' : 'btn-success'}`}
                    onClick={webcamActive ? stopVideo : startVideo}
                >
                    {webcamActive ? 'Tắt Webcam' : 'Bật Webcam'}
                </button>
            </div>
            {countdown !== null && (
                <div className="mt-2">
                    <h3>Chụp trong: {countdown} giây</h3>
                </div>
            )}

            {/* Bảng danh sách sinh viên đã điểm danh */}
            {attendedStudents.length > 0 && (
                <div className="mt-4">
                    <h3>Danh sách sinh viên đã điểm danh</h3>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">STT</th>
                                    <th scope="col">MSSV</th>
                                    <th scope="col">Họ và tên</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Thời gian điểm danh</th>
                                    <th scope="col">Ảnh</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendedStudents.map((student, index) => (
                                    <tr key={student.studentId}>
                                        <td>{index + 1}</td>
                                        <td>{student.studentId}</td>
                                        <td>{student.fullname}</td>
                                        <td>{student.email}</td>
                                        <td>{student.attendanceTime}</td>
                                        <td>
                                            <img
                                                src={student.profileImage}
                                                alt="Student Avatar"
                                                className="rounded-circle"
                                                style={{ width: '40px', height: '40px' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="text-muted">
                            <small>Tổng số sinh viên đã điểm danh: {attendedStudents.length}</small>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AttendanceRealtime;
