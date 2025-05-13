import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const WriteReview = ({ user, matchId }) => {
    const { userId } = useParams(); // Get the ID of the user being reviewed
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send the review to the backend
            await axios.post(
                `http://localhost:5000/api/reviews/${matchId || userId}`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setSuccessMessage('Review submitted successfully!');
            setErrorMessage('');
            setRating(0);
            setComment('');
        } catch (error) {
            setErrorMessage('Error submitting review. Please try again.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Write a Review</h2>
            {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
            {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="rating" className="block text-gray-700 font-medium mb-2">
                        Rating (1-5)
                    </label>
                    <select
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="0" disabled>
                            Select a rating
                        </option>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                        Comment
                    </label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your review here..."
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Submit Review
                </button>
            </form>
        </div>
    );
};

export default WriteReview;