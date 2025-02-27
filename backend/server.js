require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Import path module
const allRoutes = require('./allRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
  "https://transportproject-frontend-3yl800btq-foash-111s-projects.vercel.app/", 
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// API Routes
app.use('/api', allRoutes);

// Serve React frontend in production
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Backend available at: http://localhost:${PORT}`);
});
