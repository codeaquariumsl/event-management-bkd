import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import express from 'express';
import cors from 'cors';


import { connectDB } from './src/config/db.js';
import customerRoutes from './src/routes/customerRoutes.js';
import staffRoutes from './src/routes/staffRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import recurringRoutes from './src/routes/recurringRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import eventTypeRoutes from './src/routes/eventTypeRoutes.js';
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import quotationRoutes from './src/routes/quotationRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const time = new Date().toLocaleTimeString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
    console.log(`${statusEmoji} [${time}] ${req.method} ${req.originalUrl} -> ${status} (${duration}ms)`);
  });

  next();
});

// API Health Check
// Seekers Production Backend v1.0.0
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Seekers Entertainment Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/recurring-events', recurringRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/quotations', quotationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Seekers Entertainment API listening on http://localhost:${PORT}`);
  });
};

startServer();
