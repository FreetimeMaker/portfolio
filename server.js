const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '.')));

// Middleware to set dark mode from cookie
app.use((req, res, next) => {
  res.locals.darkMode = req.cookies.darkMode === 'true' ? 'dark' : 'light';
  next();
});

// Routes to serve the existing HTML files directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/geoweather', (req, res) => {
  res.sendFile(path.join(__dirname, 'geoweather.html'));
});

app.get('/ssmpc', (req, res) => {
  res.sendFile(path.join(__dirname, 'ssmpc.html'));
});

// API endpoint to toggle dark mode
app.post('/api/toggle-darkmode', (req, res) => {
  const currentMode = req.cookies.darkMode === 'true' ? 'true' : 'false';
  const newMode = currentMode === 'true' ? 'false' : 'true';
  
  res.cookie('darkMode', newMode, { 
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    httpOnly: false 
  });
  
  res.json({ darkMode: newMode });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('404 - Seite nicht gefunden');
});

app.listen(PORT, () => {
  console.log(`Portfolio server running on http://localhost:${PORT}`);
});
