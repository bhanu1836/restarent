const express = require('express');
const Review = require('../models/Review');

const router = express.Router();

// Get all reviews (public)
router.get('/', async (req, res) => {
  try {
    const { menuItem, restaurant } = req.query;
    let filter = {};
    
    if (menuItem) filter.menuItem = menuItem;
    if (restaurant === 'true') filter.isRestaurantReview = true;
    
    const reviews = await Review.find(filter)
      .populate('menuItem', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add review (public)
router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    await review.populate('menuItem', 'name');
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;