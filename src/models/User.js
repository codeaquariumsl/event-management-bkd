import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
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

// Hash password with bcrypt before saving to MongoDB
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  // If already hashed with bcrypt, do not double-hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored bcrypt hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
  return this.password === candidatePassword;
};

export const UserModel = mongoose.model('User', UserSchema);
