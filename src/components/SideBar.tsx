import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Or Sidebar.module.css

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Planner App</h2>
      <nav>
        <ul>
          <li><Link to="/local">Local Planner</Link></li>
          <li><Link to="/general">General Planner</Link></li>
        </ul>
      </nav>
    </div>
  );
}
