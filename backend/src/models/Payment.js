const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: Number,
  email: String,
  first_name: String,
  last_name: String,
  tx_ref: { type: String, unique: true },
  serviceName: String,
  status: { 
    type: String, 
    enum: ['success', 'failed', 'pending'], 
    default: 'pending' 
  },
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);