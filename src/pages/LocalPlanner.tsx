import React from 'react'
import '../styles/Local.module.css'
import'../index.css';

const LocalPlanner: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h2>📍 Local Date Planner</h2>
      <p>This is where local planning features will go.</p>
      <label className = "custom-field">
        <input type = "text"
        placeholder='Enter Zip'/>
        <span className = "placeholder"> </span>
      </label>
    </div>
    
  );
};

export default LocalPlanner;