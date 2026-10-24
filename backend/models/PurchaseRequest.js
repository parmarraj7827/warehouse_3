import mongoose from 'mongoose';

// ==========================================
// PURCHASE REQUEST MODEL
// This is created when a 'user' requests an item from the warehouse.
// An 'admin' will later APPROVE or REJECT it.
// ==========================================
const schema = new mongoose.Schema({
  // A unique ID for this request (like 'PR-12345')
  requestCode: {
    type: String,
    required: true,
    unique: true
  },
  
  // Who made the request? (Links to a User ID)
  userId: {
    type: mongoose.Schema.Types.ObjectId, // This is a special MongoDB ID type
    ref: 'User',                          // It points to the 'User' collection
    required: true
  },
  
  // What product do they want? (Links to a Product ID)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',                       // It points to the 'Product' collection
    required: true
  },
  
  // How many do they want?
  quantity: {
    type: Number,
    required: true,
    min: 1                               // They must request at least 1 item
  },
  
  // Why do they need it? (optional)
  reason: {
    type: String,
    default: ''
  },
  
  // What is the current status of the request?
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'], // Must be exactly one of these 3
    default: 'PENDING'                         // It starts as PENDING until an admin looks at it
  }
}, { 
  // Automatically add "createdAt" and "updatedAt" dates
  timestamps: true 
});

export default mongoose.model('PurchaseRequest', schema);
