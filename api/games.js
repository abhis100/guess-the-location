const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

let User, Game;
try {
  User = mongoose.model('User');
  Game = mongoose.model('Game');
} catch {
  User = mongoose.model('User', userSchema);
  Game = mongoose.model('Game', gameSchema);
}

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Auth middleware
const authenticateToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  await connectDB();
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = authenticateToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  try {
    if (method === 'POST') {
      // Save game
      const game = new Game({
        userId: user.userId,
        ...req.body
      });
      await game.save();
      
      // Update user's best score
      const userDoc = await User.findById(user.userId);
      if (game.totalScore > userDoc.bestScore) {
        userDoc.bestScore = game.totalScore;
      }
      userDoc.totalGames += 1;
      await userDoc.save();
      
      res.json(game);
      
    } else if (method === 'GET') {
      // Get user's games
      const games = await Game.find({ userId: user.userId }).sort({ completedAt: -1 });
      res.json(games);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Games error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}