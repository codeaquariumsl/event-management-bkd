const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI || mongoURI.includes('username:password@cluster')) {
      console.warn('⚠️  MONGODB_URI is not set or still contains the placeholder in .env');
      console.warn('👉 Please open event-management-bkd/.env and set your MongoDB Atlas connection string.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
  }
};
