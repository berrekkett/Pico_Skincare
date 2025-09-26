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

// Admin create
router.post('/', verifyToken, requireAdmin, [
  body('title').notEmpty(),
  body('price').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const t = new Treatment(req.body);
  await t.save();
  res.status(201).json(t);
});

// Admin update
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const t = await Treatment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(t);
});

// Admin delete
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  await Treatment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
