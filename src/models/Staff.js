import mongoose, { Schema } from 'mongoose';

const StaffSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    role: {
      type: String,
      enum: ['DJ', 'VJ', 'Sound Engineer', 'Lighting Technician', 'LED Technician', 'Event Crew', 'Event Manager', 'Driver', 'Assistant', 'Other'],
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
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const StaffModel = mongoose.model('Staff', StaffSchema);
