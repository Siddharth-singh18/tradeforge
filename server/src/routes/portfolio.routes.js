const express = require('express');
const router = express.Router();
const Holding = require('../models/Holding.model');
const User = require('../models/User.model');
const redisClient = require('../config/redis');

// @desc    Get portfolio holdings and total value
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const holdings = await Holding.find({ userId: req.user._id });
    
    let totalInvested = 0;
    let currentValue = 0;
    
    const enrichedHoldings = await Promise.all(holdings.map(async (holding) => {
      const currentPriceStr = await redisClient.get(`price:${holding.symbol}`);
      // Fallback if cache empty
      const currentPrice = currentPriceStr ? parseFloat(currentPriceStr) : holding.avgBuyPrice; 
      
      const invested = holding.quantity * holding.avgBuyPrice;
      const current = holding.quantity * currentPrice;
      const pnl = current - invested;
      const pnlPercent = (pnl / invested) * 100;
      
      totalInvested += invested;
      currentValue += current;
      
      return {
        ...holding.toObject(),
        currentPrice,
        pnl,
        pnlPercent,
        currentValue: current,
        investedValue: invested
      };
    }));

    const totalPnl = currentValue - totalInvested;
    const totalValue = user.virtualFunds + currentValue;

    res.json({
      cashBalance: user.virtualFunds,
      totalValue,
      totalInvested,
      totalPnl,
      holdings: enrichedHoldings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getPortfolio);

module.exports = router;
