const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');

// Get average rating and total count
router.get('/stats', async (req, res) => {
  try {
    const stats = await Rating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({ 
        averageRating: 0, 
        totalRatings: 0 
      });
    }

    res.json({
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
      totalRatings: stats[0].totalRatings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get rating stats' });
  }
});

// Submit a new rating
router.post('/', async (req, res) => {
  try {
    const { rating } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Check if this IP has already rated today (prevent spam)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRating = await Rating.findOne({
      ipAddress,
      createdAt: { $gte: today }
    });

    if (existingRating) {
      return res.status(400).json({ 
        error: 'You have already submitted a rating today. You can rate again tomorrow.' 
      });
    }

    const newRating = new Rating({
      rating: parseInt(rating),
      ipAddress,
      userAgent
    });

    await newRating.save();

    // Get updated stats
    const stats = await Rating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    res.json({
      message: 'Thank you for your rating!',
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get all ratings (for admin)
router.get('/', async (req, res) => {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 });
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ratings' });
  }
});

module.exports = router;