import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-100 text-center p-4">
      <h1 className="text-4xl font-bold mb-4">✨ AI Date Planner ✨</h1>
      <p className="text-lg mb-8">Get personalized date ideas—locally or anywhere!</p>

      <div className="flex gap-4">
        <Link to="/general">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-2xl shadow-md hover:bg-indigo-700 transition">
            General Planner
          </button>
        </Link>
        <Link to="/local">
          <button className="bg-green-600 text-white px-6 py-2 rounded-2xl shadow-md hover:bg-green-700 transition">
            Local Planner
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
