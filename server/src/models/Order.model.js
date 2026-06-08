const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  symbol:       { type: String, required: true },
  exchange:     { type: String, enum: ['NSE', 'BSE'], default: 'NSE' },
  type:         { type: String, enum: ['MARKET', 'LIMIT', 'STOP_LOSS'] },
  side:         { type: String, enum: ['BUY', 'SELL'] },
  quantity:     { type: Number, required: true },
  price:        { type: Number },         // null for MARKET orders
  executedPrice:{ type: Number },
  status:       { type: String, enum: ['PENDING','EXECUTED','CANCELLED','REJECTED'], default: 'PENDING' },
  executedAt:   { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
