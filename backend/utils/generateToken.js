import jwt from 'jsonwebtoken';

// ==========================================
// TOKEN GENERATOR
// When a user successfully logs in, we give them a "token" (like a digital ID card).
// They use this token to prove who they are on future requests.
// ==========================================

export function generateToken(user) {
  // 1. Decide what information to put INSIDE the digital ID card.
  // We only put safe things, never passwords!
  const payload = {
    userId: user._id.toString(), // The user's unique database ID
    role: user.role              // Are they a 'user' or 'admin'?
  };
  
  // 2. Get the secret signature key from our .env file.
  // This secret ensures that nobody else can forge these ID cards.
  const secretKey = process.env.JWT_SECRET;
  
  // 3. Create the token! 
  // We set it to expire in 7 days, so they'll have to log in again eventually.
  const token = jwt.sign(payload, secretKey, { expiresIn: '7d' });
  
  return token;
}
