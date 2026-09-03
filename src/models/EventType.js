import mongoose, { Schema } from 'mongoose';

const EventTypeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#00e5c9' },
    icon: { type: String, default: 'Sparkles' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    defaultServices: [{ type: String }],
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

export const EventTypeModel = mongoose.model('EventType', EventTypeSchema);
