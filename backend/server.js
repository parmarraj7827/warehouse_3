import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import our custom functions and database models
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import StockTransaction from './models/StockTransaction.js';
import PurchaseRequest from './models/PurchaseRequest.js';
import { generateToken } from './utils/generateToken.js';
import { getAuthPayload, requireRole } from './middleware/auth.js';
import productRoutes from './routes/productRoutes.js';

// Define the port our server will run on (default 4000)
const port = process.env.PORT || 4000;

// Connect to MongoDB
await connectDB();

// ==========================================
// BEGINNER CODE: CREATE DEFAULT ADMIN
// ==========================================
try {
  const adminExists = await User.findOne({ email: 'admin@wms.com' });
  if (!adminExists) {
    console.log('No admin found. Creating default admin...');
    const safePassword = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'Default Admin',
      email: 'admin@wms.com',
      password: safePassword,
      phone: '1234567890',
      role: 'admin', 
      isActive: true
    });
    console.log('✅ Success! You can now login with: admin@wms.com / admin123');
  } else {
    console.log('✅ Admin user already exists. You are good to go!');
  }
} catch (error) {
  console.log('❌ Oops! Error creating default admin:', error.message);
}
// ==========================================

// Create the Express application
const app = express();

// Allow the frontend to talk to this backend
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Tell Express to understand JSON data sent in requests
app.use(express.json());

// Dedicated Product PATCH API for the live-change exam requirement
app.use('/api', productRoutes);

// ==========================================
// HELPER FUNCTIONS
// These format the data before sending it to the frontend
// ==========================================

// Format a product object
const formatProduct = (product) => {
  return {
    id: product._id.toString(),
    productName: product.productName,
    productCode: product.productCode,
    category: product.category,
    price: product.price,
    quantity: product.quantity,
    minimumStock: product.minimumStock,
    supplier: product.supplier,
    warehouseLocation: product.warehouseLocation || '',
    description: product.description || '',
    createdAt: product.createdAt,
    // Add a status depending on how much stock is left
   status: product.status || 'active',
stockStatus: product.quantity <= product.minimumStock
  ? 'LOW STOCK'
  : 'IN STOCK'
  };
};

// Format a user object (we don't want to send passwords back!)
const formatUser = (user) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileImage: user.profileImage,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
};

// Format a purchase request by finding its related user and product
const formatRequest = async (request) => {
  // Find the user who made the request
  const user = await User.findById(request.userId);
  // Find the product they requested
  const product = await Product.findById(request.productId);
  
  return {
    id: request._id.toString(),
    requestCode: request.requestCode,
    quantity: request.quantity,
    reason: request.reason,
    status: request.status,
    createdAt: request.createdAt,
    user: user ? formatUser(user) : null,
    product: product ? formatProduct(product) : null
  };
};

// Format a stock transaction (when items come in or go out)
const formatTransaction = async (transaction) => {
  const product = await Product.findById(transaction.productId);
  const creator = await User.findById(transaction.createdBy);
  
  return {
    id: transaction._id.toString(),
    type: transaction.type,
    quantity: transaction.quantity,
    supplier: transaction.supplier,
    customer: transaction.customer,
    notes: transaction.notes,
    date: transaction.date,
    product: product ? formatProduct(product) : null,
    createdBy: creator ? formatUser(creator) : null
  };
};

// Helper function to handle database duplicate errors nicely
function handleDatabaseError(error) {
  // 11000 is MongoDB's code for "duplicate key" (like using an email that already exists)
  if (error && error.code === 11000) {
    const fieldName = Object.keys(error.keyPattern || {})[0] || 'field';
    if (fieldName === 'email') {
      return new Error('Email already exists.');
    } else {
      return new Error('Product code already exists.');
    }
  }
  return error;
}

// Generate a random, unique purchase request code (e.g., PR-123456789)
async function generateUniqueRequestCode() {
  let newCode = '';
  let codeExists = true;
  
  while (codeExists) {
    // Create a random code based on the current time
    const timePart = Date.now().toString().slice(-7);
    const randomPart = Math.floor(Math.random() * 90 + 10);
    newCode = `PR-${timePart}${randomPart}`;
    
    // Check if this code is already used in the database
    const existingRequest = await PurchaseRequest.exists({ requestCode: newCode });
    if (!existingRequest) {
      codeExists = false; // We found a unique one!
    }
  }
  
  return newCode;
}

// Get the user who is making the current request based on their token
async function getCurrentUser(request) {
  const payload = getAuthPayload(request);
  if (payload && payload.userId) {
    const user = await User.findById(payload.userId).exec();
    return user;
  }
  return null;
}

// Helper to handle adding (IN) or removing (OUT) stock
async function handleStockOperation(input, type, currentUser) {
  const quantityNumber = Math.trunc(Number(input.quantity));
  
  if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
    throw new Error('Quantity must be greater than 0.');
  }
  
  const product = await Product.findById(input.productId).exec();
  if (!product) {
    throw new Error('Product not found.');
  }
  
  // If we are taking stock OUT, make sure we have enough
  if (type === 'OUT' && quantityNumber > product.quantity) {
    throw new Error(`Insufficient stock. Available quantity is: ${product.quantity}`);
  }

  // Calculate the change: positive if IN, negative if OUT
  let quantityChange = 0;
  if (type === 'IN') {
    quantityChange = quantityNumber;
  } else if (type === 'OUT') {
    quantityChange = -quantityNumber;
  }

  // Update the product's quantity in the database
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: product._id }, 
    { $inc: { quantity: quantityChange } }, 
    { new: true }
  ).exec();
  
  if (!updatedProduct) {
    throw new Error('Could not update product stock.');
  }
  
  // Save a record of this transaction
  const newTransaction = await StockTransaction.create({
    productId: product._id, 
    type: type, 
    quantity: quantityNumber,
    supplier: input.supplier || '', 
    customer: input.customer || '', 
    notes: input.notes || '',
    date: input.date ? new Date(input.date) : new Date(), 
    createdBy: currentUser._id
  });
  
  return {
    id: newTransaction._id.toString(),
    type: newTransaction.type,
    quantity: newTransaction.quantity,
    supplier: newTransaction.supplier,
    customer: newTransaction.customer,
    notes: newTransaction.notes,
    date: newTransaction.date,
    product: formatProduct(updatedProduct)
  };
}

// ==========================================
// MAIN ACTION HANDLER
// All requests from the frontend come here
// ==========================================
async function handleAction(operation, variables, req) {
  const user = await getCurrentUser(req);
  const data = variables || {};
  
  switch (operation) {
    
    // --- AUTHENTICATION ---
    case 'LOGIN': {
      // Find user by email
      const emailToSearch = String(data.email || '').toLowerCase();
      const foundUser = await User.findOne({ email: emailToSearch }).select('+password').exec();
      
      // If no user, or user is inactive, or password doesn't match
      if (!foundUser) throw new Error('Invalid email or password.');
      if (!foundUser.isActive) throw new Error('Invalid email or password.');
      
      const isPasswordCorrect = await bcrypt.compare(data.password || '', foundUser.password);
      if (!isPasswordCorrect) throw new Error('Invalid email or password.');
      
      // Generate a login token
      const token = generateToken(foundUser);
      return { login: { token: token, user: formatUser(foundUser) } };
    }
    
    case 'REGISTER': {
      try {
        // Hash the password so it is secure
        const hashedPassword = await bcrypt.hash(data.password, 12);
        
        // Create the new user
        const newUser = await User.create({ 
          name: data.name, 
          email: String(data.email).toLowerCase(), 
          password: hashedPassword, 
          phone: data.phone || '', 
          role: 'user' // New users are always standard 'user'
        });
        
        const token = generateToken(newUser);
        return { register: { token: token, user: formatUser(newUser) } };
      } catch (error) { 
        throw handleDatabaseError(error); 
      }
    }
    
    // --- PRODUCTS & INVENTORY ---
    case 'PRODUCTS': 
    case 'INVENTORY': {
      // Allow viewing catalog products for all users and staff
      // Build a search query
      const searchQuery = {};
      
      // If user typed in the search bar
      if (data.search) {
        searchQuery.$or = [
          { productName: new RegExp(data.search, 'i') }, 
          { productCode: new RegExp(data.search, 'i') }
        ];
      }
      
      // If user selected a specific category
      if (data.category && data.category !== 'All') {
        searchQuery.category = data.category;
      }
      
      // Find the products and sort them
      let sortOrder = {};
      if (operation === 'INVENTORY') {
        sortOrder = { productName: 1 }; // A to Z
      } else {
        sortOrder = { createdAt: -1 }; // Newest first
      }
      
      const productList = await Product.find(searchQuery).sort(sortOrder).exec();
      const formattedList = productList.map(formatProduct);
      
      return { 
        products: formattedList,
        inventory: formattedList 
      };
    }
    
    case 'PRODUCT': {
      const product = await Product.findById(data.id).exec(); 
      if (!product) return { product: null };
      return { product: formatProduct(product) };
    }
    
    case 'LOW_STOCK': {
      // Only admins can view low stock report
      requireRole(user, 'admin'); 
      
      // Find products where quantity <= minimumStock
      const lowStockList = await Product.find({ $expr: { $lte: ['$quantity', '$minimumStock'] } })
        .sort({ quantity: 1 })
        .exec(); 
        
      return { lowStockProducts: lowStockList.map(formatProduct) };
    }
    
    // --- PURCHASE REQUESTS ---
    case 'MY_REQUESTS': {
      if (!user) return { myPurchaseRequests: [] };
      const query = { userId: user._id }; 
      if (data.status && data.status !== 'All') {
        query.status = data.status.toUpperCase();
      }
      
      const requestsList = await PurchaseRequest.find(query).sort({ createdAt: -1 }).exec(); 
      
      // Format all requests (this takes a little time because it looks up the product names)
      const formattedRequests = await Promise.all(requestsList.map(formatRequest));
      return { myPurchaseRequests: formattedRequests };
    }
    
    case 'ALL_REQUESTS': {
      // Admins can see everyone's requests
      requireRole(user, 'admin'); 
      
      const query = {}; 
      if (data.status && data.status !== 'All') {
        query.status = data.status.toUpperCase();
      }
      
      const allRequestsList = await PurchaseRequest.find(query).sort({ createdAt: -1 }).exec(); 
      const formattedAllRequests = await Promise.all(allRequestsList.map(formatRequest));
      return { allPurchaseRequests: formattedAllRequests };
    }
    
    // --- USER MANAGEMENT ---
    case 'USERS': { 
      // Admins can see the list of users
      requireRole(user, 'admin'); 
      const usersList = await User.find().sort({ createdAt: -1 }).exec();
      return { users: usersList.map(formatUser) }; 
    }
    
    // --- DASHBOARD STATS ---
    case 'USER_STATS': {
      // Calculate total items in the warehouse
      const stockAggregation = await Product.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]);
      const totalStock = stockAggregation[0] ? stockAggregation[0].total : 0;

      if (!user) {
        return { 
          userDashboardStats: { 
            myRequests: 0, 
            approved: 0, 
            pending: 0, 
            itemsInStock: totalStock 
          } 
        };
      }
      
      // Count different things for the user's dashboard simultaneously
      const totalRequests = await PurchaseRequest.countDocuments({ userId: user._id });
      const approvedRequests = await PurchaseRequest.countDocuments({ userId: user._id, status: 'APPROVED' });
      const pendingRequests = await PurchaseRequest.countDocuments({ userId: user._id, status: 'PENDING' });
      
      return { 
        userDashboardStats: { 
          myRequests: totalRequests, 
          approved: approvedRequests, 
          pending: pendingRequests, 
          itemsInStock: totalStock 
        } 
      };
    }
    
    case 'ADMIN_STATS': {
      requireRole(user, 'admin'); 
      
      // Get the start of today for tracking today's activity
      const startOfToday = new Date(); 
      startOfToday.setHours(0, 0, 0, 0);
      
      // Gather lots of data at once for the admin dashboard
      const totalProductsCount = await Product.countDocuments();
      
      const stockAgg = await Product.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]);
      const totalStockSum = stockAgg[0] ? stockAgg[0].total : 0;
      
      const stockInAgg = await StockTransaction.aggregate([
        { $match: { type: 'IN', date: { $gte: startOfToday } } }, 
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      const stockInToday = stockInAgg[0] ? stockInAgg[0].total : 0;
      
      const stockOutAgg = await StockTransaction.aggregate([
        { $match: { type: 'OUT', date: { $gte: startOfToday } } }, 
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      const stockOutToday = stockOutAgg[0] ? stockOutAgg[0].total : 0;
      
      const lowStockCount = await Product.countDocuments({ $expr: { $lte: ['$quantity', '$minimumStock'] } });
      
      return { 
        adminDashboardStats: { 
          totalProducts: totalProductsCount, 
          totalStock: totalStockSum, 
          stockInToday: stockInToday, 
          stockOutToday: stockOutToday, 
          lowStockProducts: lowStockCount 
        } 
      };
    }
    
    // --- STOCK TRANSACTIONS ---
    case 'TRANSACTIONS': {
      requireRole(user, 'admin'); 
      
      const query = {};
      if (data.type) {
        query.type = String(data.type).toUpperCase();
      }
      
      const transactionsList = await StockTransaction.find(query).sort({ date: -1 }).limit(100).exec(); 
      const formattedTransactions = await Promise.all(transactionsList.map(formatTransaction));
      
      return { stockTransactions: formattedTransactions };
    }
    
    // --- PRODUCT MANAGEMENT ---
    case 'CREATE_PRODUCT': {
      requireRole(user, 'admin'); 
      try { 
        // Validate numbers
          const status = String(
      data.input.status || 'active'
    ).trim().toLowerCase();

    if (!['active', 'inactive'].includes(status)) {
      throw new Error(
        'Invalid status. Allowed values are active and inactive.'
      );
    }

const price = Number(data.input.price);
const qty = Number(data.input.quantity);
const minStock = Number(data.input.minimumStock);
        
        if (price < 0 || qty < 0 || minStock < 0) {
          throw new Error('Numeric values cannot be negative.'); 
        }
        
        // Create it
        const newProduct = await Product.create({ 
          ...data.input, 
          status: status,
          price: price, 
          quantity: qty, 
          minimumStock: minStock, 
          productCode: data.input.productCode.trim().toUpperCase() 
        }); 
        
        return { createProduct: formatProduct(newProduct) }; 
      } catch (error) { 
        throw handleDatabaseError(error); 
      }
    }
    
    case 'UPDATE_PRODUCT': {
      requireRole(user, 'admin'); 
      const inputData = data.input || {};
      if (inputData.status !== undefined) {
  inputData.status = String(inputData.status).trim().toLowerCase();

  if (!['active', 'inactive'].includes(inputData.status)) {
    throw new Error(
      'Invalid status. Allowed values are active and inactive.'
    );
  }
} 
      
      const price = Number(inputData.price);
      const minStock = Number(inputData.minimumStock);
      
      if (price < 0 || minStock < 0) {
        throw new Error('Numeric values cannot be negative.');
      }
      
      // Update in database
      const updatedProduct = await Product.findByIdAndUpdate(
        data.id, 
        { 
          ...inputData, 
          price: price, 
          minimumStock: minStock, 
          warehouseLocation: inputData.warehouseLocation || '',
          productCode: inputData.productCode.trim().toUpperCase() 
        }, 
        { new: true, runValidators: true } // Return the new version
      ).exec(); 
      
      if (!updatedProduct) throw new Error('Product not found.'); 
      
      return { updateProduct: formatProduct(updatedProduct) };
    }
    
    case 'DELETE_PRODUCT': { 
      requireRole(user, 'admin'); 
      
      // Delete the product
      await Product.findByIdAndDelete(data.id).exec(); 
      
      // Also delete any history related to this product so we don't have broken links
      await StockTransaction.deleteMany({ productId: data.id }).exec(); 
      await PurchaseRequest.deleteMany({ productId: data.id }).exec(); 
      
      return { deleteProduct: true }; 
    }
    
    // --- STOCK OPERATIONS ---
    case 'STOCK_IN': 
      return { stockIn: await handleStockOperation(data.input || {}, 'IN', requireRole(user, 'admin')) };
      
    case 'STOCK_OUT': 
      return { stockOut: await handleStockOperation(data.input || {}, 'OUT', requireRole(user, 'admin')) };
      
    // --- REQUEST MANAGEMENT ---
    case 'CREATE_REQUEST': { 
      requireRole(user); 
      
      const inputData = data.input || {}; 
      const quantityNumber = Math.trunc(Number(inputData.quantity)); 
      
      if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
        throw new Error('Quantity must be greater than 0.');
      }
      
      // Make sure the product exists and check current stock before creating the request
      const product = await Product.findById(inputData.productId).exec();
      if (!product) throw new Error('Product not found.');

      // Do not allow a user to request more items than are currently in stock.
      // This backend check also protects the database if the frontend is bypassed.
      if (quantityNumber > product.quantity) {
        throw new Error(
          `Insufficient stock. Available stock for ${product.productName} is ${product.quantity}, but you requested ${quantityNumber}.`
        );
      }

      // Create the request
      const code = await generateUniqueRequestCode();
      const newRequest = await PurchaseRequest.create({ 
        requestCode: code, 
        userId: user._id, 
        productId: inputData.productId, 
        quantity: quantityNumber, 
        reason: inputData.reason || '', 
        status: 'PENDING' 
      }); 
      
      const formattedRequest = await formatRequest(newRequest);
      return { createPurchaseRequest: formattedRequest }; 
    }
    
    case 'APPROVE_REQUEST': { 
      const adminUser = requireRole(user, 'admin'); 
      
      const existingRequest = await PurchaseRequest.findById(data.id).exec(); 
      if (!existingRequest) throw new Error('Request not found.'); 
      
      if (existingRequest.status === 'APPROVED') {
        throw new Error('Request is already approved.');
      }
      
      const product = await Product.findById(existingRequest.productId).exec();
      if (!product) throw new Error('Associated product not found.');
      
      if (product.quantity < existingRequest.quantity) {
        throw new Error(`Insufficient stock. Available stock is ${product.quantity}, but requested quantity is ${existingRequest.quantity}.`);
      }
      
      // Update product quantity in Product collection
      const updatedProduct = await Product.findByIdAndUpdate(
        existingRequest.productId,
        { $inc: { quantity: -existingRequest.quantity } },
        { new: true }
      ).exec();
      
      if (!updatedProduct) throw new Error('Failed to update product stock.');
      
      // Fetch requesting user details for transaction log
      const requestingUser = await User.findById(existingRequest.userId).exec();
      
      // Create Stock Transaction (OUT)
      await StockTransaction.create({
        productId: existingRequest.productId,
        type: 'OUT',
        quantity: existingRequest.quantity,
        customer: requestingUser ? `${requestingUser.name} (${requestingUser.email})` : 'User Request',
        notes: `Approved Purchase Request #${existingRequest.requestCode}`,
        date: new Date(),
        createdBy: adminUser._id
      });
      
      // Update request status to APPROVED
      existingRequest.status = 'APPROVED';
      await existingRequest.save();
      
      return { approvePurchaseRequest: await formatRequest(existingRequest) }; 
    }
    
    case 'REJECT_REQUEST': { 
      requireRole(user, 'admin'); 
      
      const updatedRequest = await PurchaseRequest.findByIdAndUpdate(
        data.id, 
        { status: 'REJECTED' }, 
        { new: true }
      ).exec(); 
      
      if (!updatedRequest) throw new Error('Request not found.'); 
      
      return { rejectPurchaseRequest: await formatRequest(updatedRequest) }; 
    }
    
    // --- PROFILE MANAGEMENT ---
    case 'UPDATE_PROFILE': { 
      requireRole(user); // Can be user or admin
      
      const updatedUser = await User.findByIdAndUpdate(
        user._id, 
        { 
          name: data.input?.name, 
          phone: data.input?.phone || '', 
          profileImage: data.input?.profileImage || '' 
        }, 
        { new: true, runValidators: true }
      ).exec(); 
      
      return { updateProfile: formatUser(updatedUser) }; 
    }
    
    case 'UPDATE_ROLE': { 
      requireRole(user, 'admin'); 
      
      if (!['admin', 'user'].includes(data.role)) {
        throw new Error('Invalid role.');
      }
      
      // Prevent an admin from accidentally removing their own admin role
      if (String(data.id) === String(user._id) && data.role !== 'admin') {
        throw new Error('You cannot remove your own admin role.');
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        data.id, 
        { role: data.role }, 
        { new: true }
      ).exec(); 
      
      if (!updatedUser) throw new Error('User not found.'); 
      
      return { updateUserRole: formatUser(updatedUser) }; 
    }
    
    case 'SET_ACTIVE': { 
      requireRole(user, 'admin'); 
      
      // Prevent an admin from deactivating themselves
      if (String(data.id) === String(user._id) && !data.isActive) {
        throw new Error('You cannot deactivate your own account.');
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        data.id, 
        { isActive: data.isActive }, 
        { new: true }
      ).exec(); 
      
      if (!updatedUser) throw new Error('User not found.'); 
      
      return { setUserActive: formatUser(updatedUser) }; 
    }
    
    default: 
      throw new Error(`Unknown action: ${operation}`);
  }
}

// ==========================================
// ROUTES
// ==========================================

// The main action route that handles everything
app.post('/action', async (req, res) => {
  try { 
    // Call our giant handleAction function
    const result = await handleAction(req.body.op, req.body.variables, req); 
    
    // Send success back to the frontend
    res.json({ ok: true, data: result }); 
  } catch (error) { 
    console.error('Action Error:', error); 
    
    // Send error back to the frontend
    res.status(400).json({ 
      ok: false, 
      error: error.message || 'Something went wrong.' 
    }); 
  }
});

// A simple route to test if the server is running
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'wms-simple' });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 WMS server is running happily on http://localhost:${port}`);
});
