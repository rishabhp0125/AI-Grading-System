import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage/HomePage';
import EssayGrading from './EssayGrading/EssayGrading'; 
import TestGrading from './TestGrading/TestGrading'; 
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/essay-grading" element={<EssayGrading />} />
          <Route path="/test-grading" element={<TestGrading />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
