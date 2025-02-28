require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const allRoutes = require('./allRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// ✅ Improved CORS Configuration
const allowedOrigins = [
  "https://transportproject-frontend-3yl800btq-foash-111s-projects.vercel.app",
  "https://transportproject-frontend.vercel.app",
  "http://localhost:3000"
];

app.use((req, res, next) => {
  console.log(`📡 Request from: ${req.headers.origin}`);

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle Preflight Requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// API Routes
app.use('/api', allRoutes);

// Serve React frontend in production
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Backend available at: http://localhost:${PORT}`);
});
