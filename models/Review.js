import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User giving the review
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User being reviewed
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5
    comment: { type: String, trim: true }, // Optional comment
    date: { type: Date, default: Date.now }, // Date of the review
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;