const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bestScore: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
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
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
  const { action } = req.query;

  try {
    if (method === 'POST' && action === 'register') {
      const { email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please try logging in instead.' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });
      await user.save();
      
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.json({ token, user: { id: user._id, email: user.email } });
      
    } else if (method === 'POST' && action === 'login') {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.json({ token, user: { id: user._id, email: user.email } });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'An account with this email already exists. Please try logging in instead.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}