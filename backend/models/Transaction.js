const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'sale'],
    required: true
  },
  productCategory: {
    type: String,
    enum: ['Door', 'Plywood', 'Flexi', 'PVC', 'HDMR', 'Laminates', 'MDF', 'Teak Ply', 'Natural Ply', 'Royal Club Ply', 'Clubwood'],
    required: true
  },
  thickness: {
    type: String,
    required: false
  },
  size: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
