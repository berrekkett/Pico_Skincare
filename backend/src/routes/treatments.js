const express = require('express');
const router = express.Router();
const Treatment = require('../models/Treatment');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Public: list treatments
router.get('/', async (req, res) => {
  const items = await Treatment.find().sort({ createdAt: -1 });
  res.json(items);
});

// Admin create - UPDATED to match Treatment model
router.post('/', verifyToken, requireAdmin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('duration').isNumeric().withMessage('Duration must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const treatmentData = {
      name: req.body.name,
      description: req.body.description || '', // Optional field
      price: parseFloat(req.body.price),
      duration: parseInt(req.body.duration),
      icon: req.body.icon || 'sparkles' // Optional field
    };

    const t = new Treatment(treatmentData);
    await t.save();
    res.status(201).json(t);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin update - UPDATED to match Treatment model
router.put('/:id', verifyToken, requireAdmin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('duration').isNumeric().withMessage('Duration must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const treatmentData = {
      name: req.body.name,
      description: req.body.description || '',
      price: parseFloat(req.body.price),
      duration: parseInt(req.body.duration),
      icon: req.body.icon || 'sparkles'
    };

    const t = await Treatment.findByIdAndUpdate(req.params.id, treatmentData, { new: true });
    res.json(t);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin delete
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  await Treatment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;