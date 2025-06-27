import React from 'react';
import AttendanceRealtime from '../components/AttendanceRealtime';
import './RealtimeAttendancePage.css';
import DashboardLayout from '../components/DashboardLayout';

function AttendanceRealtimePage() {
    return (
        <DashboardLayout>
            <div className="myapp">
                <AttendanceRealtime />
                <footer className="real-attenndance-footer">
                    <p>&copy; 2024 - Ứng Dụng Điểm Danh. All Rights Reserved.</p>
                </footer>
            </div>
        </DashboardLayout>
    );
}

export default AttendanceRealtimePage;
