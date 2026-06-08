const Queue = require('bull');
const Order = require('../models/Order.model');
const Holding = require('../models/Holding.model');
const User = require('../models/User.model');
const redisClient = require('../config/redis');

// Initialize Bull Queue backed by Redis
const orderQueue = new Queue('order-matching', process.env.REDIS_URL || 'redis://localhost:6379');

// Producer function to add LIMIT/STOP orders to queue
const addOrderToQueue = async (orderId) => {
  await orderQueue.add({ orderId }, {
    attempts: 3,
    backoff: 5000,
    removeOnComplete: true,
  });
};

// Consumer: Process the orders periodically to check if price target is hit
orderQueue.process(async (job, done) => {
  const { orderId } = job.data;
  
  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'PENDING') {
      return done();
    }

    const currentPriceStr = await redisClient.get(`price:${order.symbol}`);
    if (!currentPriceStr) {
      // Delay job and try again later if no live price available
      return done(new Error(`No live price for ${order.symbol}`));
    }
    
    const currentPrice = parseFloat(currentPriceStr);
    let shouldExecute = false;

    // Matching logic
    if (order.type === 'LIMIT') {
      if (order.side === 'BUY' && currentPrice <= order.price) shouldExecute = true;
      if (order.side === 'SELL' && currentPrice >= order.price) shouldExecute = true;
    } else if (order.type === 'STOP_LOSS') {
      if (order.side === 'SELL' && currentPrice <= order.price) shouldExecute = true;
      if (order.side === 'BUY' && currentPrice >= order.price) shouldExecute = true;
    }

    if (shouldExecute) {
      // Execute the order (Simulated execution)
      // Note: In real life this would involve a transaction session
      order.status = 'EXECUTED';
      order.executedPrice = currentPrice;
      order.executedAt = new Date();
      await order.save();

      // Update User Funds & Holdings
      const user = await User.findById(order.userId);
      let holding = await Holding.findOne({ userId: user._id, symbol: order.symbol });
      
      const totalValue = currentPrice * order.quantity;

      if (order.side === 'BUY') {
        user.virtualFunds -= totalValue;
        if (holding) {
          const newQuantity = holding.quantity + order.quantity;
          holding.avgBuyPrice = ((holding.avgBuyPrice * holding.quantity) + totalValue) / newQuantity;
          holding.quantity = newQuantity;
          await holding.save();
        } else {
          await Holding.create({
            userId: user._id,
            symbol: order.symbol,
            exchange: order.exchange,
            quantity: order.quantity,
            avgBuyPrice: currentPrice,
          });
        }
      } else if (order.side === 'SELL') {
        user.virtualFunds += totalValue;
        if (holding) {
          holding.quantity -= order.quantity;
          if (holding.quantity <= 0) {
            await Holding.findByIdAndDelete(holding._id);
          } else {
            await holding.save();
          }
        }
      }
      
      await user.save();
    } else {
      // Target price not hit, throw error to retry later via backoff
      throw new Error('Price target not reached');
    }
    
    done();
  } catch (error) {
    done(error);
  }
});

module.exports = { orderQueue, addOrderToQueue };
