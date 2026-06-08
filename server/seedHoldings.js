const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const Holding = require('./src/models/Holding.model');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/tradeforge');
};

const seed = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: 'demo@tradeforge.com' });
    if (!user) {
      console.log('Demo user not found');
      process.exit(1);
    }

    // Clear existing holdings
    await Holding.deleteMany({ userId: user._id });

    // Add mock holdings
    const holdings = [
      { symbol: 'RELIANCE.NS', quantity: 50, avgBuyPrice: 2800.00 },
      { symbol: 'TCS.NS', quantity: 20, avgBuyPrice: 3800.00 },
      { symbol: 'HDFCBANK.NS', quantity: 150, avgBuyPrice: 1550.00 }
    ];

    for (let h of holdings) {
      await Holding.create({ ...h, userId: user._id });
    }

    // Adjust virtual funds
    const invested = (50*2800) + (20*3800) + (150*1550);
    user.virtualFunds = 1000000 - invested;
    await user.save();

    console.log(`Holdings seeded successfully! Total invested: ₹${invested}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
