import mongoose, { Schema } from 'mongoose';

const ServiceItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Production' },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const StaffAssignmentSchema = new Schema(
  {
    id: { type: String, required: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    role: { type: String, required: true },
    assignedDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    paymentAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, default: 'Confirmed' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const EventExpenseSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, default: 'Miscellaneous' },
    amount: { type: Number, default: 0 },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const TimelineItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    timestamp: { type: String, default: () => new Date().toLocaleString() },
    completed: { type: Boolean, default: false },
    type: { type: String, default: 'created' },
  },
  { _id: false }
);

const EventSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerCompany: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    eventType: { type: String, default: 'Wedding' },
    eventDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Confirmed',
    },
    services: [ServiceItemSchema],
    assignedStaff: [StaffAssignmentSchema],
    expenses: [EventExpenseSchema],
    timeline: [TimelineItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    additionalCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    recurringSeriesId: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
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

export const EventModel = mongoose.model('Event', EventSchema);
