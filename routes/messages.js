import express from 'express';
import auth from '../middleware/auth.js';
import Message from '../models/Message.js';

const router = express.Router();

router.post('/messages', auth, async (req, res) => {
  const { receiverId, content } = req.body;
  const message = new Message({
    sender: req.user.userId,
    receiver: receiverId,
    content,
  });
  await message.save();

  // Emit notification event
  const io = req.app.get('io');
  console.log(`Emitting newMessage event to receiverId: ${receiverId}`);
  io.to(receiverId).emit('newMessage', {
    sender: req.user.userId,
    content,
  });

  res.json(message);
});

router.get('/messages/:userId', auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.userId, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.userId },
    ],
  }).populate('sender receiver', 'name');
  res.json(messages);
});

export default router;