import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CustomerModel } from '../models/Customer.js';
import { StaffModel } from '../models/Staff.js';
import { EventModel } from '../models/Event.js';
import { RecurringEventModel } from '../models/RecurringEvent.js';
import { CustomerPaymentModel, StaffPaymentModel } from '../models/Payment.js';
import { CompanyProfileModel, ServiceCatalogModel } from '../models/CompanyProfile.js';
import { UserModel } from '../models/User.js';
import { ROLE_DEFAULT_PERMISSIONS } from '../controllers/userController.js';

dotenv.config();


async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('username:password@cluster')) {
    console.error('❌ MONGODB_URI is not set or still contains placeholders in .env!');
    console.error('👉 Please paste your real MongoDB Atlas connection string into event-management-bkd/.env first.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas!');

    console.log('🧹 Clearing old collections...');
    await Promise.all([
      CustomerModel.deleteMany({}),
      StaffModel.deleteMany({}),
      EventModel.deleteMany({}),
      RecurringEventModel.deleteMany({}),
      CustomerPaymentModel.deleteMany({}),
      StaffPaymentModel.deleteMany({}),
      CompanyProfileModel.deleteMany({}),
      ServiceCatalogModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);

    console.log('🎉 MongoDB Atlas Seeding Completed Successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
}

seed();
