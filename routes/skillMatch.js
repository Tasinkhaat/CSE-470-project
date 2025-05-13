import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/skill-match', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    // Find users whose skillsToTeach match the current user's skillsToLearn
    const matches = await User.find({
      skillsToTeach: { $in: user.skillsToLearn },
      privacy: 'public',
      _id: { $ne: user._id },
    }).select('-password');

    // For each match, only include the skillsToTeach that match the current user's skillsToLearn
    const filteredMatches = matches.map(match => {
      const matchingSkills = match.skillsToTeach.filter(skill => user.skillsToLearn.includes(skill));
      return {
        ...match.toObject(),
        skillsToTeach: matchingSkills,
      };
    });

    res.json(filteredMatches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;