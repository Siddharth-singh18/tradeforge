const mongoose = require('mongoose');
const { Schema } = mongoose;

const holdingSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  symbol:       { type: String, required: true },
  exchange:     { type: String, default: 'NSE' },
  quantity:     { type: Number, required: true },
  avgBuyPrice:  { type: Number, required: true },
  currentPrice: { type: Number },
}, { timestamps: true });

// compound unique index
holdingSchema.index({ userId: 1, symbol: 1, exchange: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
