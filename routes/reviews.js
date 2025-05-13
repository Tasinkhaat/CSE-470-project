import express from 'express';
import auth from '../middleware/auth.js';
import Review from '../models/Review.js';

const router = express.Router();

// Route to submit a review
router.post('/reviews/:userId', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        // Validate input
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }

        // Create a new review
        const review = new Review({
            reviewer: req.user.userId, // Current logged-in user
            reviewee: req.params.userId, // User being reviewed
            rating,
            comment,
        });

        // Save the review to the database
        await review.save();

        res.status(201).json({ message: 'Review submitted successfully.', review });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/reviews/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.userId });
        const averageRating =
            reviews.length > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                : 0;
        res.json({ reviews, averageRating });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;