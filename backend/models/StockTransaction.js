import mongoose from 'mongoose';

// ==========================================
// STOCK TRANSACTION MODEL
// This acts as a history log. Every time stock goes IN or OUT, 
// we save a transaction to remember who did it and when.
// ==========================================
const schema = new mongoose.Schema({
  // Which product was moved?
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Did stock come IN (added) or go OUT (removed)?
  type: {
    type: String,
    enum: ['IN', 'OUT'], // Must be exactly 'IN' or 'OUT'
    required: true
  },
  
  // How many items were moved?
  quantity: {
    type: Number,
    required: true,
    min: 1               // Must move at least 1 item
  },
  
  // If stock came IN, who supplied it? (optional)
  supplier: {
    type: String,
    default: ''
  },
  
  // If stock went OUT, who is the customer? (optional)
  customer: {
    type: String,
    default: ''
  },
  
  // Any extra notes? (optional)
  notes: {
    type: String,
    default: ''
  },
  
  // When did this happen?
  date: {
    type: Date,
    default: Date.now // If not provided, use the exact current time
  },
  
  // Which admin/user actually did this action?
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  // Automatically add "createdAt" and "updatedAt" dates
  timestamps: true 
});

export default mongoose.model('StockTransaction', schema);
