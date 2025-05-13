import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ user }) => {
  const navigate = useNavigate();

  const handleFindMatches = () => {
    if (user) {
      navigate('/matches');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to SkillShare</h2>
      <p className="text-gray-600 mb-6">
        Connect with others to teach and learn new skills. Find matches based on your skills and
        interests!
      </p>
      <button
        onClick={handleFindMatches}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Find Matches
      </button>
    </div>
  );
};

export default Home;