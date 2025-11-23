import mongoose, { Schema, Document } from "mongoose";

export interface IBuyer extends Document {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  googleId?: string;
  provider?: string;
  isOAuthUser: boolean;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  isAuthenticated: boolean;
  forgotPasswordToken?: string;
  forgotPasswordExpires?: Date;
  verifyToken?: string;
  verifyExpires?: Date;
  isVerified: boolean;
  
  // Step 1: Basic Company Verification Fields
  companyRegistrationCertificate?: string;
  companyRegistrationNumber?: string;
  companyName?: string;
  dateOfIncorporation?: Date;
  ssmCompanyProfileDocument?: string;
  businessTradeLicenseDocument?: string;
  businessLicenseNumber?: string;
  businessLicenseIssuingAuthority?: string;
  businessLicenseExpiryDate?: Date;
  
  // Step 2: Importer Verification Fields
  importLicenseDocument?: string;
  importLicenseNumber?: string;
  issuingAuthority?: string;
  importLicenseExpiryDate?: Date;
  foodSafetyCertificateDocument?: string;
  foodSafetyAuthority?: string;
  foodSafetyCertificateNumber?: string;
  foodSafetyLicenseExpiryDate?: Date;
  
  // Step 3: Tax & Financial Legitimacy Fields
  taxRegistrationCertificateDocument?: string;
  taxRegistrationNumber?: string;
  taxRegistrationAuthority?: string;
  bankLetterOrStatementDocument?: string;
  bankName?: string;
  accountHolderName?: string;
  
  // Step 4: Ownership & Identity Verification Fields
  directorIdDocument?: string;
  businessAddressProofDocument?: string;
  businessAddress?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const BuyerSchema = new Schema<IBuyer>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, default: "local" },
    isOAuthUser: { type: Boolean, default: false },
    phone: { type: String },
    avatar: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    isAuthenticated: { type: Boolean, default: false },
    forgotPasswordToken: { type: String, unique: true, sparse: true },
    forgotPasswordExpires: { type: Date },
    verifyToken: { type: String, unique: true, sparse: true },
    verifyExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    
    // Step 1: Basic Company Verification Fields
    companyRegistrationCertificate: { type: String },
    companyRegistrationNumber: { type: String },
    companyName: { type: String },
    dateOfIncorporation: { type: Date },
    ssmCompanyProfileDocument: { type: String },
    businessTradeLicenseDocument: { type: String },
    businessLicenseNumber: { type: String },
    businessLicenseIssuingAuthority: { type: String },
    businessLicenseExpiryDate: { type: Date },
    
    // Step 2: Importer Verification Fields
    importLicenseDocument: { type: String },
    importLicenseNumber: { type: String },
    issuingAuthority: { type: String },
    importLicenseExpiryDate: { type: Date },
    foodSafetyCertificateDocument: { type: String },
    foodSafetyAuthority: { type: String },
    foodSafetyCertificateNumber: { type: String },
    foodSafetyLicenseExpiryDate: { type: Date },
    
    // Step 3: Tax & Financial Legitimacy Fields
    taxRegistrationCertificateDocument: { type: String },
    taxRegistrationNumber: { type: String },
    taxRegistrationAuthority: { type: String },
    bankLetterOrStatementDocument: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String },
    
    // Step 4: Ownership & Identity Verification Fields
    directorIdDocument: { type: String },
    businessAddressProofDocument: { type: String },
    businessAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

// Add virtual for addresses
BuyerSchema.virtual("addresses", {
  ref: "Address",
  localField: "_id",
  foreignField: "userId",
});

BuyerSchema.set("toObject", { virtuals: true });
BuyerSchema.set("toJSON", { virtuals: true });

export const Buyer = mongoose.model<IBuyer>("Buyer", BuyerSchema);

