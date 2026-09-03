import mongoose, { Schema } from 'mongoose';

const CustomerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    company: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    customerType: {
      type: String,
      enum: ['Individual', 'Company', 'Hotel', 'Club', 'Restaurant', 'Corporate', 'Other'],
      default: 'Individual',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Lead'],
      default: 'Active',
    },
    notes: { type: String, default: '' },
    totalEvents: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CustomerModel = mongoose.model('Customer', CustomerSchema);
