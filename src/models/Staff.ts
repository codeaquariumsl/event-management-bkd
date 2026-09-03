import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  role: 'DJ' | 'Sound Engineer' | 'Lighting Technician' | 'LED Technician' | 'Event Manager' | 'Driver' | 'Assistant' | 'Other';
  skills: string[];
  employmentType: 'Full Time' | 'Part Time' | 'Freelance' | 'Contract';
  status: 'Active' | 'On Leave' | 'Inactive';
  joiningDate: string;
  basicSalary: number;
  defaultRatePerEvent: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branch: string;
  };
  notes?: string;
  totalEventsAssigned: number;
  totalEventsCompleted: number;
  totalEarnings: number;
  pendingPayments: number;
}

const StaffSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    role: {
      type: String,
      enum: ['DJ', 'Sound Engineer', 'Lighting Technician', 'LED Technician', 'Event Manager', 'Driver', 'Assistant', 'Other'],
      default: 'DJ',
    },
    skills: [{ type: String }],
    employmentType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Freelance', 'Contract'],
      default: 'Freelance',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    joiningDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    basicSalary: { type: Number, default: 0 },
    defaultRatePerEvent: { type: Number, default: 15000 },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      branch: { type: String, default: '' },
    },
    notes: { type: String, default: '' },
    totalEventsAssigned: { type: Number, default: 0 },
    totalEventsCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    pendingPayments: { type: Number, default: 0 },
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

export const StaffModel = mongoose.model<IStaff>('Staff', StaffSchema);
