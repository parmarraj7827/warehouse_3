import jwt from 'jsonwebtoken';

// ==========================================
// AUTHENTICATION MIDDLEWARE & HELPERS
// These functions check if a user is logged in and 
// if they are allowed to do certain actions.
// ==========================================

// This function looks at the incoming request from the frontend
// and tries to read their secret login token.
export function getAuthPayload(req) {
  // 1. Get the 'Authorization' header from the request
  const header = req.headers.authorization || ''; 
  
  // 2. Tokens usually start with the word 'Bearer '. 
  // If it doesn't, they are not properly logged in.
  if (!header.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    // 3. Remove the word 'Bearer ' (which is 7 characters long) to get just the token string
    const tokenString = header.slice(7);
    
    // 4. Verify that the token is real and wasn't forged.
    // We use the exact same secret password from our .env file that we used to create it.
    const decodedPayload = jwt.verify(tokenString, process.env.JWT_SECRET);
    
    // If successful, this returns the user's ID and role!
    return decodedPayload; 
    
  } catch (error) {
    // If the token is fake, expired, or broken, we catch the error and return null.
    return null;
  }
}

// This function makes sure the user exists AND has the right permissions
export function requireRole(user, requiredRole) {
  // 1. If there is no user logged in at all, stop them here.
  if (!user) {
    throw new Error('Authentication required. Please log in.');
  }
  
  // 2. If a specific role is required (like 'admin'), check if the user has it.
  if (requiredRole && user.role !== requiredRole) {
    throw new Error(`Unauthorized. You must be an ${requiredRole} to do this.`);
  }
  
  // 3. If they passed the checks, return the user so the code can continue!
  return user;
}
