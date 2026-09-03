import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: 'seekers2026' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: [
        'Super Admin',
        'Event Director',
        'Production Manager',
        'Finance Officer',
        'Crew Coordinator',
        'Read Only',
      ],
      default: 'Event Director',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    permissions: [{ type: String }],
    lastLogin: { type: String, default: () => new Date().toLocaleString() },
    createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.model('User', UserSchema);
