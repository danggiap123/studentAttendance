import React from 'react';
import '../App.css';
function ExportCSV() {
  const handleExport = () => {
    fetch('http://localhost:8000/api/exportCSV')
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'students.csv';
        link.click();
      });
  };

  return (
    <div>
      <button onClick={handleExport}>Xuất CSV</button>
    </div>
  );
}

export default ExportCSV;
