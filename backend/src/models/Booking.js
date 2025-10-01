// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  treatment: { type: String, default: '' }, // Add this field
  date: { type: Date, required: true },
  notes: { type: String, default: '' },
  status: { type: String, default: 'pending' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);