import mongoose, { Schema } from 'mongoose';

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
    permissions: [{ type: String }],
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

export const RoleModel = mongoose.model('Role', RoleSchema);
