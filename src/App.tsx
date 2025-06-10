import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/SideBar';
import LocalPlanner from './pages/LocalPlanner';
import GeneralPlanner from './pages/GeneralPlanner';
import Home from './pages/home';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ marginLeft: 200, padding: '20px', flex: 1 }}>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/local" element={<LocalPlanner />} />
            <Route path="/general" element={<GeneralPlanner />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
