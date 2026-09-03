import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerPayment extends Document {
  id: string;
  invoiceNumber: string;
  eventId: string;
  eventName: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  status: string;
  eventTotal: number;
  eventPaid: number;
  eventBalance: number;
}

const CustomerPaymentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, required: true },
    eventId: { type: String, required: true },
    eventName: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    referenceNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, default: 'Paid' },
    eventTotal: { type: Number, default: 0 },
    eventPaid: { type: Number, default: 0 },
    eventBalance: { type: Number, default: 0 },
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

export const CustomerPaymentModel = mongoose.model<ICustomerPayment>('CustomerPayment', CustomerPaymentSchema);

export interface IStaffPayment extends Document {
  id: string;
  staffId: string;
  staffName: string;
  eventId?: string;
  eventName?: string;
  paymentType: string;
  date: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  monthYear?: string;
}

const StaffPaymentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    eventId: { type: String, default: '' },
    eventName: { type: String, default: '' },
    paymentType: {
      type: String,
      enum: ['Event Payment', 'Salary', 'Advance', 'Bonus', 'Deduction', 'Other'],
      default: 'Event Payment',
    },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    status: { type: String, default: 'Paid' },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    referenceNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
    monthYear: { type: String, default: '' },
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

export const StaffPaymentModel = mongoose.model<IStaffPayment>('StaffPayment', StaffPaymentSchema);
