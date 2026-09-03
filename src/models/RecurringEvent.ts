import mongoose, { Schema, Document } from 'mongoose';
import { IServiceItem } from './Event';

export interface IRecurringEvent extends Document {
  id: string;
  seriesName: string;
  customerId: string;
  customerName: string;
  eventType: string;
  frequency: 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Custom';
  startDate: string;
  endDate: string;
  eventDay?: string;
  startTime: string;
  endTime: string;
  location: string;
  defaultPrice: number;
  paymentTerms: string;
  services: IServiceItem[];
  assignedStaffIds: string[];
  status: 'Active' | 'Paused' | 'Completed';
  generatedCount: number;
  lastGeneratedDate?: string;
  notes?: string;
  createdAt: string;
}

const RecurringEventSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    seriesName: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    eventType: { type: String, default: 'Club / Concert' },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Custom'],
      default: 'Weekly',
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    eventDay: { type: String, default: '' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    defaultPrice: { type: Number, default: 0 },
    paymentTerms: { type: String, default: '' },
    services: [{ type: Schema.Types.Mixed }],
    assignedStaffIds: [{ type: String }],
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Completed'],
      default: 'Active',
    },
    generatedCount: { type: Number, default: 0 },
    lastGeneratedDate: { type: String },
    notes: { type: String, default: '' },
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

export const RecurringEventModel = mongoose.model<IRecurringEvent>('RecurringEvent', RecurringEventSchema);
