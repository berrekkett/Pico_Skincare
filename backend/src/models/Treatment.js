// const mongoose = require('mongoose');

// const TreatmentSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: String,
//   price: { type: String, required: true }, // keep as string for "From $80" or use number if you want numeric
//   duration: String,
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Treatment', TreatmentSchema);
 


const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true } // minutes
});

module.exports = mongoose.model('Treatment', treatmentSchema);
