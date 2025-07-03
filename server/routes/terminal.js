const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.post('/', (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'No command provided' });

  exec(command, { cwd: process.cwd(), timeout: 5000 }, (error, stdout, stderr) => {
    if (error) {
      return res.json({ stdout, stderr: error.message });
    }
    res.json({ stdout, stderr });
  });
});

module.exports = router; 