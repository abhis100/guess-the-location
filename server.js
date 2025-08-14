const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/geoguessr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bestScore: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Game Schema
const gameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rounds: [{
    location: {
      lat: Number,
      lng: Number,
      country: String,
      description: String
    },
    guess: {
      lat: Number,
      lng: Number
    },
    distance: Number,
    score: Number
  }],
  totalScore: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Game = mongoose.model('Game', gameSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please try logging in instead.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'An account with this email already exists. Please try logging in instead.' });
    }
    res.status(400).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/games', authenticateToken, async (req, res) => {
  try {
    const game = new Game({
      userId: req.user.userId,
      ...req.body
    });
    await game.save();
    
    // Update user's best score
    const user = await User.findById(req.user.userId);
    if (game.totalScore > user.bestScore) {
      user.bestScore = game.totalScore;
    }
    user.totalGames += 1;
    await user.save();
    
    res.json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/games', authenticateToken, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.user.userId }).sort({ completedAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({})
      .select('email bestScore totalGames')
      .sort({ bestScore: -1 })
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});