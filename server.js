const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '.')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to set dark mode from cookie
app.use((req, res, next) => {
  res.locals.darkMode = req.cookies.darkMode === 'true' ? 'dark' : 'light';
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/geoweather', (req, res) => {
  res.render('geoweather');
});

app.get('/ssmpc', (req, res) => {
  res.render('ssmpc');
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
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Portfolio server running on http://localhost:${PORT}`);
});
