const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// MongoDB connection
mongoose.connect('mongodb+srv://walvekarprathamesh734:tsPO9d9KQSgWVjcT@testdbn.68ixc.mongodb.net/prthamesh', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(cors({
  origin: 'https://webosbyprathamesh.vercel.app',
  credentials: true
}));

app.use(session({
  secret: 'bolt-super-secret-key', // use a strong secret in production!
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // set to true if using HTTPS
    sameSite: 'lax'
  }
}));

app.use(bodyParser.json());

// Placeholder routes
app.use('/api/terminal', require('./routes/terminal'));
app.use('/api/files', require('./routes/files'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 
