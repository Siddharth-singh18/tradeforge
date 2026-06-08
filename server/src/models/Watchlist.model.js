const mongoose = require('mongoose');
const { Schema } = mongoose;

const watchlistSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name:   { type: String, required: true },
  stocks: [{ 
    symbol: String, 
    exchange: String, 
    addedAt: { type: Date, default: Date.now } 
  }],
}, { timestamps: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
