import mongoose from 'mongoose';

// ==========================================
// PRODUCT MODEL
// This defines what a "Product" in our warehouse looks like
// ==========================================
const productSchema = new mongoose.Schema({
  // The display name of the product
  productName: {
    type: String,
    required: true,
    trim: true
  },
  
  // A unique code/barcode for the product (like 'LAPTOP-01')
  productCode: {
    type: String,
    required: true,
    unique: true,   // No two products can have the same code
    trim: true,
    uppercase: true // Always save as uppercase (laptop-01 -> LAPTOP-01)
  },
  
  // What group does this belong to? (e.g., Electronics, Furniture)
  category: {
    type: String,
    required: true,
    trim: true
  },
  
  // How much does it cost?
  price: {
    type: Number,
    min: 0,         // Price cannot be a negative number!
    required: true
  },
  
  // How many of these do we currently have in the warehouse?
  quantity: {
    type: Number,
    min: 0,         // We can't have less than 0 items
    required: true,
    default: 0      // Starts at 0 when you first add it
  },
  
  // Who makes this product? (optional)
  supplier: {
    type: String,
    default: '',
    trim: true
  },
  
  // The "Low Stock" warning line. If quantity drops below this, we get a warning!
  minimumStock: {
    type: Number,
    min: 0,
    required: true,
    default: 5      // By default, warn us if we have 5 or less left
  },
  status: {
  type: String,
  enum: ['active', 'inactive'],
  default: 'active',
  lowercase: true,
  trim: true
},

  // Where this product is stored inside the warehouse
  warehouseLocation: {
    type: String,
    default: '',
    trim: true
  }
}, { 
  // Automatically add "createdAt" and "updatedAt" dates
  timestamps: true 
});

export default mongoose.model('Product', productSchema);
