require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const ratingRoutes = require('./routes/ratings');
const paymentRoutes = require("./routes/payments");

// Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const treatmentRoutes = require('./routes/treatments');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ---------------- Security & Middleware ----------------
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// CORS: allow your frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Basic rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100
});
app.use(limiter);

// ---------------- Routes ----------------
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use("/api/payments", paymentRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// ---------------- DB Connection & Server ----------------
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI) // No deprecated options
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection error', err);
    process.exit(1);
  });
