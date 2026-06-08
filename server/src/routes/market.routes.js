const express = require('express');
const router = express.Router();
const { getScreener } = require('../controllers/market.controller');

router.get('/screener', getScreener);

module.exports = router;
