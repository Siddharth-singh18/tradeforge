const express = require('express');
const router = express.Router();
const {
  getWatchlists,
  createWatchlist,
  addSymbolToWatchlist,
  removeSymbolFromWatchlist
} = require('../controllers/watchlist.controller');

router.get('/', getWatchlists);
router.post('/', createWatchlist);
router.post('/:id/items', addSymbolToWatchlist);
router.delete('/:id/items/:symbol', removeSymbolFromWatchlist);

module.exports = router;
