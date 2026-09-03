import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
  customerType: 'Individual' | 'Company' | 'Hotel' | 'Club' | 'Restaurant' | 'Corporate' | 'Other';
  status: 'Active' | 'Inactive' | 'Lead';
  notes?: string;
  totalEvents: number;
  totalRevenue: number;
  outstandingBalance: number;
  createdAt: string;
}

const CustomerSchema: Schema = new Schema(
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
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CustomerModel = mongoose.model<ICustomer>('Customer', CustomerSchema);
