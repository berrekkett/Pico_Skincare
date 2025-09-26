const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if(!admin) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, admin.password);
  if(!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: admin._id, role: admin.role, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

module.exports = router;
