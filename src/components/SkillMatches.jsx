import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WriteReview from './WriteReviews'; // Import the WriteReview component

const SkillMatches = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [reviewsData, setReviewsData] = useState({}); // Store reviews and ratings for each user

  useEffect(() => {
    if (user) {
      // Fetch matches
      axios
        .get('http://localhost:5000/api/skill-match', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => setMatches(res.data))
        .catch((err) => console.error('Error fetching matches:', err));
    }
  }, [user]);

  useEffect(() => {
    // Fetch reviews for each match
    const fetchReviews = async () => {
      const reviewsMap = {};
      for (const match of matches) {
        try {
          const res = await axios.get(`http://localhost:5000/api/reviews/${match._id}`);
          reviewsMap[match._id] = res.data; // Store reviews and average rating
        } catch (err) {
          console.error(`Error fetching reviews for user ${match._id}:`, err);
        }
      }
      setReviewsData(reviewsMap);
    };

    if (matches.length > 0) {
      fetchReviews();
    }
  }, [matches]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Skill Matches</h2>
      {matches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No matches found. Update your skills to find better matches!</p>
          <Link
            to="/profile"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Update Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <div
              key={match._id}
              className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center mb-4">
                <img
                  src={match.profilePicture ? `http://localhost:5000${match.profilePicture}` : 'http://localhost:5000/uploads/default.jpg'}
                  alt={match.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <h3 className="text-lg font-medium text-gray-800">{match.name}</h3>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">Teaches</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {match.skillsToTeach.length > 0 ? (
                    match.skillsToTeach.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">None</span>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">Wants to Learn</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {match.skillsToLearn.length > 0 ? (
                    match.skillsToLearn.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">None</span>
                  )}
                </div>
              </div>

              {/* Display Reviews or Write Review */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">Reviews</h4>
                {reviewsData[match._id]?.reviews?.length > 0 ? (
                  <div>
                    <p className="text-gray-800">
                      Average Rating: {reviewsData[match._id].averageRating.toFixed(1)} / 5
                    </p>
                    <ul className="mt-2">
                      {reviewsData[match._id].reviews.map((review) => (
                        <li key={review._id} className="text-gray-600">
                          <strong>{review.reviewer.name}:</strong> {review.comment} ({review.rating}/5)
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <WriteReview user={user} matchId={match._id} />
                )}
              </div>

              <Link
                to={`/messages/${match._id}`}
                className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Message
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillMatches;