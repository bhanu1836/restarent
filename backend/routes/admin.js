const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get analytics data (admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItem', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } }
    ]);
    
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      popularItems,
      dailySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage chefs (admin only)
router.get('/chefs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const chefs = await User.find({ role: 'chef' }).select('-password');
    res.json(chefs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/chefs/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { isActive } = req.body;
    const chef = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    res.json(chef);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;