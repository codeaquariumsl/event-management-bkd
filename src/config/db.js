import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI || mongoURI.includes('username:password@cluster')) {
    console.warn('⚠️  MONGODB_URI is not set or still contains the placeholder in .env');
    console.warn('👉 Please open event-management-bkd/.env and set your MongoDB Atlas connection string.');
    return;
  }

  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Error: Could not connect to Atlas cluster.');
    console.warn('👉 Please verify your current IP is whitelisted in MongoDB Atlas Network Access: https://cloud.mongodb.com');
    // Auto-retry connection every 10 seconds
    setTimeout(() => {
      if (mongoose.connection.readyState !== 1) {
        connectDB();
      }
    }, 10000);
  }
};
