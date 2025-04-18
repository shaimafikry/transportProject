require('dotenv').config();
const express = require('express');
const cors = require('cors');
const allRoutes = require('./allRoute');
const checkAndSendEmails = require('./sendEmail')

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Correct CORS Configuration
const allowedOrigins = [
  "https://transportproject-frontend.vercel.app", // Your frontend on Vercel
  "https://transport-project-eta.vercel.app",
  "http://localhost:3000" // Local development
];

// ✅ Log Incoming Requests
app.use((req, res, next) => {
  console.log(`📡 Incoming Request: ${req.method} ${req.url}`);
  console.log(`🌍 Origin: ${req.headers.origin || "Unknown"}`);
  console.log(`🕵️‍♂️ User-Agent: ${req.headers["user-agent"]}`);
  next();
});

// ✅ Handle CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle Preflight Requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ✅ Apply CORS Before Routes
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// API Routes
app.use('/', allRoutes);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// Start email checking process every 24 hours
setInterval(() => {
  checkAndSendEmails();
  console.log("✅ Scheduled email check triggered");
}, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

console.log("check email sender run");
