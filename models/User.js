import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  bio: String,
  skillsToTeach: [String],
  skillsToLearn: [String],
  profilePicture: String,
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  wishlist: [String],
  ratings: [{ userId: String, rating: Number, review: String }],
  badges: [String],
  progress: [{ skill: String, status: String }],
});

export default mongoose.model('User', userSchema);