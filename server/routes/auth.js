const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    await User.create({ username, password });
    req.session.username = username;
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      req.session.username = username;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.username = null;
  res.json({ success: true });
});

// Status
router.get('/status', (req, res) => {
  res.json({ loggedIn: !!req.session.username, username: req.session.username });
});

// List users (for login screen)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username');
    res.json(users.map(u => u.username));
  } catch (e) {
    res.status(500).json({ error: 'Failed to list users' });
  }
});

module.exports = router; 