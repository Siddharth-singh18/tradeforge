const express = require('express');
const router = express.Router();
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const redisClient = require('../config/redis');
const { addOrderToQueue } = require('../jobs/orderMatcher.job');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  const { symbol, exchange, type, side, quantity, price } = req.body;

  try {
    const user = await User.findById(req.user._id);
    let orderPrice = price;

    if (type === 'MARKET') {
      const currentPriceStr = await redisClient.get(`price:${symbol}`);
      if (!currentPriceStr) {
        return res.status(400).json({ message: `No live price available for ${symbol}` });
      }
      orderPrice = parseFloat(currentPriceStr);
    }

    const order = await Order.create({
      userId: req.user._id,
      symbol,
      exchange: exchange || 'NSE',
      type,
      side,
      quantity,
      price: type === 'MARKET' ? null : price,
      status: 'PENDING'
    });

    // If MARKET order, execute immediately (for demo, queue it but it executes instantly in logic)
    // Actually, let's just queue everything and let the Matcher handle it immediately.
    await addOrderToQueue(order._id);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post('/', placeOrder);
router.get('/', getOrders);

module.exports = router;
