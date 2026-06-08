const Watchlist = require('../models/Watchlist.model');

// @desc    Get all watchlists for user
// @route   GET /api/watchlists
// @access  Private
const getWatchlists = async (req, res) => {
  try {
    const watchlists = await Watchlist.find({ userId: req.user._id });
    res.json(watchlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new watchlist
// @route   POST /api/watchlists
// @access  Private
const createWatchlist = async (req, res) => {
  const { name } = req.body;
  
  try {
    const count = await Watchlist.countDocuments({ userId: req.user._id });
    if (count >= 5) {
      return res.status(400).json({ message: 'Maximum 5 watchlists allowed' });
    }

    const watchlist = await Watchlist.create({
      userId: req.user._id,
      name,
      stocks: []
    });

    res.status(201).json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add symbol to watchlist
// @route   POST /api/watchlists/:id/items
// @access  Private
const addSymbolToWatchlist = async (req, res) => {
  const { symbol, exchange } = req.body;
  const { id } = req.params;

  try {
    const watchlist = await Watchlist.findOne({ _id: id, userId: req.user._id });
    if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });

    if (watchlist.stocks.some(s => s.symbol === symbol)) {
      return res.status(400).json({ message: 'Symbol already in watchlist' });
    }

    watchlist.stocks.push({ symbol, exchange: exchange || 'NSE' });
    await watchlist.save();

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove symbol from watchlist
// @route   DELETE /api/watchlists/:id/items/:symbol
// @access  Private
const removeSymbolFromWatchlist = async (req, res) => {
  const { id, symbol } = req.params;

  try {
    const watchlist = await Watchlist.findOne({ _id: id, userId: req.user._id });
    if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });

    watchlist.stocks = watchlist.stocks.filter(s => s.symbol !== symbol);
    await watchlist.save();

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWatchlists,
  createWatchlist,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist
};
