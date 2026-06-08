const redisClient = require('../config/redis');

// Mock data for screener since free APIs don't have good screener endpoints
const MOCK_SCREENER_DATA = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy', mcap: '20L Cr', pe: 28.5 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT', mcap: '14L Cr', pe: 31.2 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Finance', mcap: '12L Cr', pe: 16.4 },
  { symbol: 'INFY.NS', name: 'Infosys', sector: 'IT', mcap: '6L Cr', pe: 24.1 },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Finance', mcap: '7L Cr', pe: 17.8 },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Finance', mcap: '6.5L Cr', pe: 10.2 }
];

// @desc    Get screener data
// @route   GET /api/market/screener
// @access  Public
const getScreener = async (req, res) => {
  try {
    // Enrich mock data with live prices from redis
    const enrichedData = await Promise.all(MOCK_SCREENER_DATA.map(async (stock) => {
      const priceStr = await redisClient.get(`price:${stock.symbol}`);
      // Usually base price is not perfectly known without historical data, but we can return raw price
      return {
        ...stock,
        currentPrice: priceStr ? parseFloat(priceStr) : null,
      };
    }));

    res.json(enrichedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getScreener
};
