const redisClient = require('../config/redis');

const STARTING_PRICES = {
  'RELIANCE.NS': 2950.50,
  'TCS.NS': 3920.00,
  'INFY.NS': 1450.25,
  'HDFCBANK.NS': 1640.80,
  'ICICIBANK.NS': 1050.40,
  'SBIN.NS': 750.30,
};

// Start price simulator
const startSimulator = (io) => {
  console.log('Starting price simulator...');
  
  setInterval(async () => {
    const updates = [];
    
    for (const [symbol, basePrice] of Object.entries(STARTING_PRICES)) {
      // Simulate random price change +/- 0.1%
      const changePercent = (Math.random() - 0.5) * 0.2; 
      const changeAmount = basePrice * (changePercent / 100);
      let currentPrice = basePrice + changeAmount;
      
      // Try to get last price from redis, if exists use that as base
      const cached = await redisClient.get(`price:${symbol}`);
      if (cached) {
        currentPrice = parseFloat(cached) * (1 + (Math.random() - 0.5) * 0.002);
      }
      
      currentPrice = parseFloat(currentPrice.toFixed(2));
      const change = parseFloat((currentPrice - basePrice).toFixed(2));
      const percent = parseFloat(((change / basePrice) * 100).toFixed(2));
      
      const payload = {
        symbol,
        price: currentPrice,
        change: change,
        changePercent: percent,
        volume: Math.floor(Math.random() * 5000),
        timestamp: Date.now()
      };
      
      updates.push(payload);
      
      // Update cache
      await redisClient.set(`price:${symbol}`, currentPrice, 'EX', 5);
      
      // Broadcast to room
      io.to(symbol).emit('price_update', payload);
    }
  }, 1000); // Emits every second
};

module.exports = { startSimulator };
