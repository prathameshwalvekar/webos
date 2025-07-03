const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer();

const fileSchema = new mongoose.Schema({
  username: { type: String, required: true },
  path: { type: String, required: true }, // e.g. 'folder/file.txt'
  isDirectory: { type: Boolean, default: false },
  content: { type: Buffer }, // for files only
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});
fileSchema.index({ username: 1, path: 1 }, { unique: true });
const File = mongoose.model('File', fileSchema);

function requireLogin(req, res, next) {
  if (!req.session.username) return res.status(401).json({ error: 'Not logged in' });
  next();
}

// List files and folders in a directory
router.get('/', requireLogin, async (req, res) => {
  try {
    const dir = req.query.path || '';
    const username = req.session.username;
    const regex = new RegExp(`^${dir ? dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/' : ''}[^/]+$`);
    const files = await File.find({ username, path: { $regex: regex } });
    res.json(files.map(f => ({ name: f.path.split('/').pop(), isDirectory: f.isDirectory })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Read file
router.get('/read', requireLogin, async (req, res) => {
  try {
    const username = req.session.username;
    const file = await File.findOne({ username, path: req.query.path, isDirectory: false });
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json({ data: file.content.toString('utf-8') });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Download file
router.get('/download', requireLogin, async (req, res) => {
  try {
    const username = req.session.username;
    const file = await File.findOne({ username, path: req.query.path, isDirectory: false });
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.set('Content-Disposition', `attachment; filename="${file.path.split('/').pop()}"`);
    res.send(file.content);
  } catch (e) {
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Write file
router.post('/write', requireLogin, async (req, res) => {
  try {
    const username = req.session.username;
    const { path, data } = req.body;
    await File.findOneAndUpdate(
      { username, path },
      { $set: { content: Buffer.from(data || '', 'utf-8'), isDirectory: false, updated: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Upload file
router.post('/upload', requireLogin, upload.single('file'), async (req, res) => {
  try {
    const username = req.session.username;
    const path = req.body.path || req.file.originalname;
    await File.findOneAndUpdate(
      { username, path },
      { $set: { content: req.file.buffer, isDirectory: false, updated: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete file or folder
router.delete('/', requireLogin, async (req, res) => {
  try {
    const username = req.session.username;
    const { path } = req.body;
    // Delete file/folder and all children if directory
    const file = await File.findOne({ username, path });
    if (!file) return res.json({ success: true });
    if (file.isDirectory) {
      await File.deleteMany({ username, path: { $regex: `^${path}(/|$)` } });
    } else {
      await File.deleteOne({ username, path });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Move/rename file or folder
router.post('/move', requireLogin, async (req, res) => {
  try {
    const username = req.session.username;
    const { oldPath, newPath } = req.body;
    const file = await File.findOne({ username, path: oldPath });
    if (!file) return res.status(404).json({ error: 'File not found' });
    // If directory, update all children paths
    if (file.isDirectory) {
      const children = await File.find({ username, path: { $regex: `^${oldPath}(/|$)` } });
      for (const child of children) {
        const relative = child.path.slice(oldPath.length);
        child.path = newPath + relative;
        await child.save();
      }
    }
    file.path = newPath;
    await file.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to move/rename file' });
  }
});

// Create folder
router.post('/mkdir', requireLogin, async (req, res) => {
  try {
    const username = req.session.username;
    const { path } = req.body;
    await File.findOneAndUpdate(
      { username, path },
      { $set: { isDirectory: true, updated: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

module.exports = router; 