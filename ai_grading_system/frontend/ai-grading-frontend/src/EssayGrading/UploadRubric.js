import React, { useState, forwardRef } from 'react';
import './UploadRubric.css';

const UploadRubric = forwardRef((props, ref) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/upload_rubric', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      alert(`Rubric uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading rubric:', error);
      alert('Failed to upload rubric.');
    }
  };

  return (
    <div className="upload-rubric">
      <h2><i className="fas fa-upload"></i> Upload Rubric</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} ref={ref} className="form-control-file" />
      <button onClick={handleUpload} className="btn btn-primary mt-2">
        <i className="fas fa-cloud-upload-alt"></i> Upload
      </button>
    </div>
  );
});

export default UploadRubric;
