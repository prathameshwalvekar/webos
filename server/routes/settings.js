const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  settings: { type: Object, default: {} }
});
const Settings = mongoose.model('Settings', settingsSchema);

function requireLogin(req, res, next) {
  if (!req.session.username) return res.status(401).json({ error: 'Not logged in' });
  next();
}

// Get settings
router.get('/', requireLogin, async (req, res) => {
  try {
    const doc = await Settings.findOne({ username: req.session.username });
    if (doc) {
      res.json(doc.settings);
    } else {
      res.json({ theme: 'light', accent: 'orange' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// Set settings
router.post('/', requireLogin, async (req, res) => {
  try {
    await Settings.findOneAndUpdate(
      { username: req.session.username },
      { $set: { settings: req.body } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

module.exports = router; 