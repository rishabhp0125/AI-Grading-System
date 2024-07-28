import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page-container">
      <div className="home-page">
        <div className="header-section">
          <h1 className="main-heading"><i className="fas fa-home"></i> Welcome to the AI Grading System</h1>
          <p className="description">
            A powerful tool for automating the grading process. Our system uses advanced AI algorithms to provide accurate and timely feedback on both essays and tests. Whether you're a student looking to improve or an educator seeking efficiency, our solution is designed to meet your needs.
          </p>
          <div className="button-group">
            <Link to="/essay-grading" className="btn btn-primary navigate-button">
              <i className="fas fa-pencil-alt"></i> Go to Essay Grading
            </Link>
            <Link to="/test-grading" className="btn btn-primary navigate-button">
              <i className="fas fa-file-alt"></i> Go to Test Grading
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
