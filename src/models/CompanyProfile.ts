import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyProfile extends Document {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  businessRegistration: string;
  currency: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
  logoUrl?: string;
  invoiceTerms: string;
}

const CompanyProfileSchema = new Schema(
  {
    name: { type: String, required: true },
    tagline: { type: String, default: '' },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    taxNumber: { type: String, default: '' },
    businessRegistration: { type: String, default: '' },
    currency: { type: String, default: 'LKR' },
    bankName: { type: String, default: '' },
    bankAccount: { type: String, default: '' },
    bankBranch: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    invoiceTerms: { type: String, default: '' },
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

export const CompanyProfileModel = mongoose.model<ICompanyProfile>('CompanyProfile', CompanyProfileSchema);

export interface IServiceCatalogItem extends Document {
  id: string;
  name: string;
  category: string;
  description: string;
  unitPrice: number;
}

const ServiceCatalogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Production' },
    description: { type: String, default: '' },
    unitPrice: { type: Number, default: 0 },
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

export const ServiceCatalogModel = mongoose.model<IServiceCatalogItem>('ServiceCatalog', ServiceCatalogSchema);
