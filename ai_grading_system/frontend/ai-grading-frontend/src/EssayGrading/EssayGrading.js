import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UploadRubric from './UploadRubric';
import LoadingBar from '../LoadingBar/LoadingBar';
import './EssayGrading.css';

const EssayGrading = () => {
  const [text, setText] = useState('');
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    try {
      const response = await axios.post('http://localhost:5000/submit_assignment', { text });

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

      const parsedGrade = parseGrade(response.data.grade);
      setGrade(parsedGrade);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment.');
    } finally {
      setLoading(false);
    }
  };

  const parseGrade = (gradeText) => {
    const lines = gradeText.split('\n');
    let formattedGrade = '';
    let feedback = [];

    lines.forEach(line => {
      if (line.includes(':')) {
        const [category, score] = line.split(':');
        formattedGrade += `${category.trim()}: ${score.trim()}\n`;
      } else {
        if (line.trim()) {
          feedback.push(line.trim());
        }
      }
    });

    return { formattedGrade, feedback };
  };

  const handleReset = () => {
    setText('');
    setGrade(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container App">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><i className="fas fa-pencil-alt"></i> Essay Grading</h1>
        <Link to="/" className="btn btn-info">
          <i className="fas fa-home"></i> Home
        </Link>
      </div>

      <UploadRubric ref={fileInputRef} />

      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your assignment here"
          className="form-control"
        ></textarea>
        <div className="button-group mt-3">
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-paper-plane"></i> Submit
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            <i className="fas fa-redo-alt"></i> Reset
          </button>
        </div>
      </form>

      {loading && <LoadingBar progress={progress} />}

      {grade && (
        <div className="grade-container mt-4">
          <h2><i className="fas fa-graduation-cap"></i> Grade</h2>
          <pre className="grade-text">{grade.formattedGrade}</pre>
          <ul className="feedback-list">
            {grade.feedback.map((item, index) => (
              <li key={index}><i className="fas fa-comment-alt"></i> {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EssayGrading;
