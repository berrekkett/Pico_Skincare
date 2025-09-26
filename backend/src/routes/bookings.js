const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Treatment = require('../models/Treatment');
const { body, validationResult } = require('express-validator');
const { sendBookingNotification } = require('../utils/mail');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Create booking (public)
router.post('/', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('date').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Validate date not in past
    const date = new Date(req.body.date);
    if(isNaN(date.getTime()) || date < new Date()) {
      return res.status(400).json({ error: 'Invalid or past date' });
    }

    let treatmentTitle = req.body.treatmentTitle || null;
    if (req.body.treatment) {
      const t = await Treatment.findById(req.body.treatment);
      if (t) treatmentTitle = t.title;
    }

    const booking = new Booking({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      treatment: req.body.treatment || null,
      treatmentTitle: treatmentTitle,
      date: date,
      notes: req.body.notes || ''
    });
    await booking.save();

    // send email notification (non-blocking)
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
