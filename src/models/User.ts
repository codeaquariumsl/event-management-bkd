import mongoose, { Schema, Document } from 'mongoose';

export type UserRole =
  | 'Super Admin'
  | 'Event Director'
  | 'Production Manager'
  | 'Finance Officer'
  | 'Crew Coordinator'
  | 'Read Only';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Suspended';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
}

const UserSchema: Schema = new Schema(
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
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
