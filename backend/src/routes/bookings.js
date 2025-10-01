const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Treatment = require('../models/Treatment');
const { body, validationResult } = require('express-validator');
const { sendBookingNotification } = require('../utils/mail');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Create booking (public)
// routes/bookings.js - Update the POST route
router.post('/', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('date').notEmpty(),
  body('treatment').optional() // Add this line
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const date = new Date(req.body.date);
    if(isNaN(date.getTime()) || date < new Date()) {
      return res.status(400).json({ error: 'Invalid or past date' });
    }

    const booking = new Booking({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      treatment: req.body.treatment || '', // Add this
      date: date,
      notes: req.body.notes || '',
      status: 'pending'
    });
    
    await booking.save();

    // Send email notification
    sendBookingNotification(booking).catch(err => console.error('mail error', err));

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});
// Admin: list bookings
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 }).populate('treatment');
  res.json(bookings);
});

// Admin: update status
router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if(!['pending','confirmed','cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const b = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(b);
});

module.exports = router;
