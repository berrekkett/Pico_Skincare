require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Admin.findOne({ email: process.env.SEED_ADMIN_EMAIL });
  if(existing) {
    console.log('Admin exists:', existing.email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
  const admin = new Admin({ name: 'Owner', email: process.env.SEED_ADMIN_EMAIL, password: hash });
  await admin.save();
  console.log('Admin created:', admin.email);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
