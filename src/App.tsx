import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/SideBar';
import LocalPlanner from './pages/LocalPlanner';
import GeneralPlanner from './pages/GeneralPlanner';
import Home from './pages/home';
import './App.css'; 
import'./index.css';

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/local" element={<LocalPlanner />} />
            <Route path="/general" element={<GeneralPlanner />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
