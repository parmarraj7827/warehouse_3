import mongoose from 'mongoose';

// ==========================================
// USER MODEL
// This defines how a "User" is saved in the database
// ==========================================
const userSchema = new mongoose.Schema({
  // The user's full name
  name: {
    type: String,
    required: true, // They MUST provide a name
    trim: true      // Removes extra spaces (e.g. "  John  " becomes "John")
  },
  
  // The user's email address (used to login)
  email: {
    type: String,
    required: true,
    unique: true,   // No two users can have the same email
    lowercase: true, // Always save as lowercase (JOHN@test.com -> john@test.com)
    trim: true
  },
  
  // The user's secret password
  password: {
    type: String,
    required: true,
    select: false   // IMPORTANT: Don't automatically send the password when we fetch a user!
  },
  
  // The user's phone number (optional)
  phone: {
    type: String,
    default: ''     // If they don't provide one, save an empty string
  },
  
  // What kind of access does this user have?
  role: {
    type: String,
    enum: ['admin', 'user'], // The role MUST be exactly 'admin' or 'user'
    default: 'user'          // By default, everyone is a normal 'user'
  },
  
  // A link to their profile picture (optional)
  profileImage: {
    type: String,
    default: ''
  },
  
  // Is this account currently active? (An admin can deactivate accounts)
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  // Automatically add "createdAt" and "updatedAt" dates to every user
  timestamps: true 
});

// Create and export the model so other files can use it
export default mongoose.model('User', userSchema);
