require('dotenv').config();
const express = require('express');
const cors = require('cors');
const allRoutes = require('./allRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());


const allowedOrigins = [
  "https://transport-project-azure.vercel.app", 
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// تحميل جميع الـ Routes
app.use('/', allRoutes);

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Backend available at: http://localhost:${PORT}`);
});