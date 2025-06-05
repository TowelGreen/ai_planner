import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/home';
import GeneralPlanner from './pages/GeneralPlanner';
import LocalPlanner from './pages/LocalPlanner';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/general" element={<GeneralPlanner />} />
        <Route path="/local" element={<LocalPlanner />} />
      </Routes>
    </Router>
  );
};

export default App;