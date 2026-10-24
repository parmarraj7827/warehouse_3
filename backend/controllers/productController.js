import mongoose from 'mongoose';
import Product from '../models/Product.js';
import StockTransaction from '../models/StockTransaction.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import { getAuthPayload, requireRole } from '../middleware/auth.js';

function requireAdmin(req) {
  const user = getAuthPayload(req);
  requireRole(user, 'admin');
  return user;
}

function requireAuth(req) {
  const user = getAuthPayload(req);
  requireRole(user);
  return user;
}

function sendError(res, error, fallback = 'Request failed.') {
  console.error('Product API Error:', error);
  if (error?.code === 11000) {
    return res.status(409).json({ ok: false, error: 'Product code already exists.' });
  }
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({ ok: false, error: error.message });
  }
  if (error?.message?.includes('Authentication required')) {
    return res.status(401).json({ ok: false, error: error.message });
  }
  if (error?.message?.includes('Unauthorized')) {
    return res.status(403).json({ ok: false, error: error.message });
  }
  return res.status(500).json({ ok: false, error: error?.message || fallback });
}

function validateProductInput(body, { partial = false } = {}) {
  const input = { ...body };
  const required = ['productName', 'productCode', 'category', 'price'];
  if (!partial) {
    for (const field of required) {
      if (input[field] === undefined || input[field] === null || String(input[field]).trim() === '') {
        throw new Error(`${field} is required.`);
      }
    }
  }
  if (input.productName !== undefined) input.productName = String(input.productName).trim();
  if (input.productCode !== undefined) input.productCode = String(input.productCode).trim().toUpperCase();
  if (input.category !== undefined) input.category = String(input.category).trim();
  if (input.supplier !== undefined) input.supplier = String(input.supplier || '').trim();
  if (input.warehouseLocation !== undefined) {
  input.warehouseLocation =
    String(input.warehouseLocation || '').trim();
}

if (input.status !== undefined) {
  input.status = String(input.status).trim().toLowerCase();

  if (!['active', 'inactive'].includes(input.status)) {
    throw new Error(
      'Invalid status. Allowed values are active and inactive.'
    );
  }
}
  if (input.price !== undefined) {
    input.price = Number(input.price);
    if (!Number.isFinite(input.price) || input.price < 0) throw new Error('Price must be a number greater than or equal to 0.');
  }
  if (input.quantity !== undefined) {
    input.quantity = Number(input.quantity);
    if (!Number.isFinite(input.quantity) || input.quantity < 0) throw new Error('Quantity must be a number greater than or equal to 0.');
  }
  if (input.minimumStock !== undefined) {
    input.minimumStock = Number(input.minimumStock);
    if (!Number.isFinite(input.minimumStock) || input.minimumStock < 0) throw new Error('Minimum stock must be a number greater than or equal to 0.');
  }
  // Never let a request overwrite MongoDB-managed fields.
  delete input._id;
  delete input.__v;
  delete input.createdAt;
  delete input.updatedAt;
  return input;
}

// GET /api/products - list products
export async function getProducts(req, res) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean().exec();
    return res.json({ ok: true, count: products.length, products });
  } catch (error) { return sendError(res, error, 'Could not get products.'); }
}

// GET /api/products/:id - get one product
export async function getProductById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ ok: false, error: 'Invalid product ID.' });
    const product = await Product.findById(req.params.id).lean().exec();
    if (!product) return res.status(404).json({ ok: false, error: 'Product not found.' });
    return res.json({ ok: true, product });
  } catch (error) { return sendError(res, error, 'Could not get product.'); }
}

// POST /api/products - create a product
export async function createProduct(req, res) {
  try {
    requireAdmin(req);
    const input = validateProductInput(req.body);
    const product = await Product.create({
      quantity: 0,
      minimumStock: 5,
      supplier: '',
      warehouseLocation: '',
      ...input
    });
    return res.status(201).json({ ok: true, message: 'Product created successfully.', product });
  } catch (error) {
    if (error?.message?.endsWith('is required.') || error?.message?.startsWith('Price must') || error?.message?.startsWith('Quantity must') || error?.message?.startsWith('Minimum stock must')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    return sendError(res, error, 'Could not create product.');
  }
}

// PATCH /api/products/:id - update only fields sent in the request
export async function updateProduct(req, res) {
  try {
    requireAdmin(req);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ ok: false, error: 'Invalid product ID.' });
    const input = validateProductInput(req.body, { partial: true });
    if (!Object.keys(input).length) return res.status(400).json({ ok: false, error: 'Send at least one field to update.' });
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: input }, { new: true, runValidators: true }).exec();
    if (!product) return res.status(404).json({ ok: false, error: 'Product not found.' });
    return res.json({ ok: true, message: 'Product updated successfully.', product });
  } catch (error) {
    if (error?.message?.endsWith('is required.') || error?.message?.startsWith('Price must') || error?.message?.startsWith('Quantity must') || error?.message?.startsWith('Minimum stock must')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    return sendError(res, error, 'Could not update product.');
  }
}

// DELETE /api/products/:id - delete product and its related records
export async function deleteProduct(req, res) {
  try {
    requireAdmin(req);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ ok: false, error: 'Invalid product ID.' });
    const product = await Product.findByIdAndDelete(req.params.id).exec();
    if (!product) return res.status(404).json({ ok: false, error: 'Product not found.' });
    await Promise.all([
      StockTransaction.deleteMany({ productId: req.params.id }).exec(),
      PurchaseRequest.deleteMany({ productId: req.params.id }).exec()
    ]);
    return res.json({ ok: true, message: 'Product and related history deleted successfully.', productId: req.params.id });
  } catch (error) { return sendError(res, error, 'Could not delete product.'); }
}
