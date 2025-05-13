import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import skillMatchRoutes from './routes/skillMatch.js';
import messageRoutes from './routes/messages.js';
import reviewRoutes from './routes/reviews.js';
import { Server } from 'socket.io';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect('mongodb+srv://tasin:12345@tasin.fuul5kz.mongodb.net/skillshare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Multer for Profile Picture Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
app.use(upload.single('profilePicture'));

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', skillMatchRoutes);
app.use('/api', messageRoutes);
app.use('/api', reviewRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

server.listen(5000, () => console.log('Server running on port 5000'));