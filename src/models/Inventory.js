import mongoose, { Schema } from 'mongoose';

const InventoryCategorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#00e5c9' },
    icon: { type: String, default: 'Boxes' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
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

export const InventoryCategoryModel = mongoose.model('InventoryCategory', InventoryCategorySchema);

const InventoryItemSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    unitPrice: { type: Number, default: 0 },
    rentalRate: { type: Number, default: 0 },
    totalStock: { type: Number, default: 1 },
    availableQuantity: { type: Number, default: 1 },
    damagedQuantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Maintenance'],
      default: 'In Stock',
    },
    unit: { type: String, default: 'Unit' },
    specifications: { type: String, default: '' },
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

export const InventoryItemModel = mongoose.model('InventoryItem', InventoryItemSchema);
