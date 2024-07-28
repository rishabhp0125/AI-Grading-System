import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingBar from '../LoadingBar/LoadingBar';
import './TestGrading.css';

const TestGrading = () => {
  const [image, setImage] = useState(null);
  const [grade, setGrade] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [markedAnswers, setMarkedAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/grade-test', formData);

      let currentProgress = 0;
      const interval = setInterval(() => {
        if (currentProgress >= 100) {
          clearInterval(interval);
        } else {
          currentProgress += 10;
          setProgress(currentProgress);
        }
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 1000));

      setGrade(response.data.grade);
      setExtractedText(response.data.extracted_text);
      setMarkedAnswers(response.data.marked_answers);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setGrade(null);
    setExtractedText('');
    setMarkedAnswers([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container App">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><i className="fas fa-file-alt"></i> Test Grading</h1>
        <Link to="/" className="btn btn-info">
          <i className="fas fa-home"></i> Home
        </Link>
      </div>
      <div className="upload-section">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          ref={fileInputRef} 
          className="form-control-file"
        />
        {image && <img src={image} alt="Uploaded test" className="uploaded-image img-thumbnail mt-3" />}
      </div>

      {loading && <LoadingBar progress={progress} />}

      {grade && (
        <div className="grade-container mt-4">
          <h2><i className="fas fa-graduation-cap"></i> Grade</h2>
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{grade}</div>
        </div>
      )}
      {(grade || extractedText || markedAnswers.length > 0) && (
        <button onClick={handleReset} className="btn btn-secondary mt-3">
          <i className="fas fa-redo-alt"></i> Reset
        </button>
      )}
    </div>
  );
};

export default TestGrading;
