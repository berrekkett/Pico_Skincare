const express = require("express");
const axios = require("axios");
const Payment = require("../models/Payment");

const router = express.Router();

// Pay endpoint
router.post("/pay", async (req, res) => {
  try {
    console.log("🔍 Payment request received:", req.body);
    
    const { amount, email, first_name, last_name, tx_ref, serviceName } = req.body;

    // Validate required fields
    if (!amount || !email || !tx_ref) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Chapa API call
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        first_name: first_name || "Customer",
        last_name: last_name || "User",
        tx_ref,
        callback_url: `http://localhost:5173/payment-success?tx_ref=${tx_ref}`,
        return_url: `http://localhost:5173/payment-success?tx_ref=${tx_ref}`,
        customizations: {
          title: "Pico Skincare & Cosmetics",
          description: serviceName || "Skincare Treatment",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🔍 Chapa response:", response.data);

    // Save payment to DB
      // In routes/payments.js - pay endpoint
      const newPayment = new Payment({
        amount,
        email,
        first_name: first_name || "Customer",
        last_name: last_name || "User",
        tx_ref,
        serviceName: serviceName || "Skincare Treatment",
        status: 'pending',
        bookingId: req.body.bookingId // Add this line
      });
    
    await newPayment.save();
    console.log("✅ Payment saved to database");

    res.json(response.data);
  } catch (err) {
    console.error("❌ Payment error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Payment initialization failed",
      details: err.response?.data || err.message 
    });
  }
});

// Verify endpoint
router.get("/verify/:tx_ref", async (req, res) => {
  try {
    const { tx_ref } = req.params;
    console.log("🔍 Verifying payment:", tx_ref);

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    console.log("🔍 Verification response:", response.data);

    // Update payment status in DB
    const status = response.data.status === 'success' ? 'success' : 'failed';
    await Payment.findOneAndUpdate(
      { tx_ref },
      { status },
      { new: true }
    );

    res.json(response.data);
  } catch (err) {
    console.error("❌ Verification error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Payment verification failed",
      details: err.response?.data || err.message 
    });
  }
});

// Get all payments
router.get("/all", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error("❌ Fetch payments error:", err.message);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

module.exports = router;