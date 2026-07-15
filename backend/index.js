require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const analyzerRoutes = require('./routes/analyzerRoutes');
const reportRoutes = require('./routes/reportRoutes');
const historyRoutes = require('./routes/historyRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: false
}));

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com') || origin.endsWith('.github.io')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/analyzer', analyzerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Internal server error' });
});

async function startServer() {
  await db.connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
