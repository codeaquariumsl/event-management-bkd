import mongoose, { Schema } from 'mongoose';

const QuotationLineItemSchema = new Schema(
  {
    id: { type: String, required: true },
    itemId: { type: String, default: '' },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const QuotationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    quotationNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerCompany: { type: String, default: '' },
    eventType: { type: String, default: 'Wedding' },
    eventDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    validUntil: { type: String, default: () => new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] },
    venue: { type: String, default: '' },
    items: [QuotationLineItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    additionalCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
      default: 'Draft',
    },
    notes: { type: String, default: '' },
    termsAndConditions: { type: String, default: '' },
    convertedEventId: { type: String, default: null },
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

export const QuotationModel = mongoose.model('Quotation', QuotationSchema);
