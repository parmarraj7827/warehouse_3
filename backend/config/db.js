import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const connectDB = async () => {
  try {
    const databaseUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/wms';
    
    // Attempt to connect to MongoDB
    await mongoose.connect(databaseUrl);
    
    // If it succeeds, print a happy message!
    console.log('✅ MongoDB connected successfully!');
    
  } catch (error) {
    // If the database is offline or the URL is wrong, it will fail here.
    console.error('❌ MongoDB connection failed:', error.message);
    
    // process.exit(1) forcefully stops the server because without a database,
    // our app cannot work properly.
    process.exit(1);
  }
};