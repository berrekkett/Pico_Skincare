const mongoose = require('mongoose');

// In models/Treatment.js - Make sure this exists:
const treatmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  icon: { type: String, default: 'sparkles' } // ✅ This must be here
}, {
  timestamps: true
});

module.exports = mongoose.model('Treatment', treatmentSchema);
