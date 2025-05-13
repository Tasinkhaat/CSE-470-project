import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  res.json(user);
});

router.get('/profile/:userId', auth, async (req, res) => {
  const user = await User.findById(req.params.userId).select('name');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/profile', auth, async (req, res) => {
  const updates = req.body;
  if (req.file) updates.profilePicture = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
  res.json(user);
});

// Update skill progress
router.put('/profile/progress', auth, async (req, res) => {
  const { skill, status } = req.body;
  if (!skill || !status) return res.status(400).json({ error: 'Skill and status are required' });
  try {
    const user = await User.findById(req.user.userId);
    const progressIndex = user.progress.findIndex(p => p.skill === skill);
    if (progressIndex > -1) {
      user.progress[progressIndex].status = status;
    } else {
      user.progress.push({ skill, status });
    }
    await user.save();
    res.json(user.progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;