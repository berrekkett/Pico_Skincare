// const mongoose = require('mongoose');

// const BookingSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   treatment: { type: mongoose.Schema.Types.ObjectId, ref: 'Treatment' },
//   treatmentTitle: { type: String }, // denormalized for quick reads
//   date: { type: Date, required: true },
//   notes: String,
//   status: { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Booking', BookingSchema);


const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  treatment: { type: mongoose.Schema.Types.ObjectId, ref: 'Treatment' },
  date: { type: Date, required: true }
});

module.exports = mongoose.model('Booking', bookingSchema);
