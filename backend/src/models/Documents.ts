import mongoose, { Schema, Document } from "mongoose";

export interface IDocuments extends Document {
  // Step 1: Business Identity Verification
  panNumber?: string;
  gstNumber?: string;
  ownerIdDocument?: string;
  incorporationCertificate?: string;
  msmeUdyamCertificate?: string;
  businessAddressProof?: string;
  aadharNumber?: string;
  
  // Step 2: Export Eligibility Verification
  iecCode?: string;
  iecCertificate?: string;
  apedaRegistrationNumber?: string;
  apedaCertificate?: string;
  spicesBoardRegistrationNumber?: string;
  spicesBoardCertificate?: string;
  tradeLicense?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankProofDocument?: string;
  
  // Step 3: Food & Safety Compliance
  fssaiLicenseNumber?: string;
  fssaiCertificate?: string;
  foodQualityCertifications: string[];
  labTestingCapability: boolean;
  
  // Step 4: Shipping & Logistics
  shippingType?: string;
  serviceAreas: string[];
  returnPolicy?: string;
  
  // Step 5: Export Documentation & Shipment Capability
  certificateOfOriginCapability: boolean;
  phytosanitaryCertificateCapability: boolean;
  packagingCompliance: boolean;
  fumigationCertificateCapability: boolean;
  exportLogisticsPrepared: boolean;
  
  // Verification Status
  verificationStatus?: string;
  verificationSubmittedAt?: Date;
  verificationReviewedAt?: Date;
  verificationNotes?: string;
  verifiedDocuments: string[]; // Array of document field names verified by admin
  changedFields: string[]; // Array of field names that were changed by seller and need admin review
  
  // Auto-Verification Status (for documents verified via API/algorithm)
  autoVerified: {
    panNumber?: { verified: boolean; verifiedAt?: Date; details?: string };
    gstNumber?: { verified: boolean; verifiedAt?: Date; details?: string };
    aadharNumber?: { verified: boolean; verifiedAt?: Date; details?: string };
    iecCode?: { verified: boolean; verifiedAt?: Date; details?: string };
    bankIfscCode?: { verified: boolean; verifiedAt?: Date; bankName?: string; branchName?: string };
    bankAccountNumber?: { verified: boolean; verifiedAt?: Date; details?: string };
    fssaiLicenseNumber?: { verified: boolean; verifiedAt?: Date; details?: string };
  };
  
  // Legacy fields (keeping for backward compatibility)
  gstCertificate?: string;
  panCard?: string;
  businessLicense?: string;
  canceledCheque?: string;
}

const DocumentsSchema = new Schema<IDocuments>(
  {
    // Step 1: Business Identity Verification
    panNumber: { type: String },
    gstNumber: { type: String },
    ownerIdDocument: { type: String },
    incorporationCertificate: { type: String },
    msmeUdyamCertificate: { type: String },
    businessAddressProof: { type: String },
    aadharNumber: { type: String },
    
    // Step 2: Export Eligibility Verification
    iecCode: { type: String },
    iecCertificate: { type: String },
    apedaRegistrationNumber: { type: String },
    apedaCertificate: { type: String },
    spicesBoardRegistrationNumber: { type: String },
    spicesBoardCertificate: { type: String },
    tradeLicense: { type: String },
    bankAccountHolderName: { type: String },
    bankAccountNumber: { type: String },
    bankIfscCode: { type: String },
    bankProofDocument: { type: String },
    
    // Step 3: Food & Safety Compliance
    fssaiLicenseNumber: { type: String },
    fssaiCertificate: { type: String },
    foodQualityCertifications: { type: [String], default: [] },
    labTestingCapability: { type: Boolean, default: false },
    
    // Step 4: Shipping & Logistics
    shippingType: { type: String },
    serviceAreas: { type: [String], default: [] },
    returnPolicy: { type: String },
    
    // Step 5: Export Documentation & Shipment Capability
    certificateOfOriginCapability: { type: Boolean, default: false },
    phytosanitaryCertificateCapability: { type: Boolean, default: false },
    packagingCompliance: { type: Boolean, default: false },
    fumigationCertificateCapability: { type: Boolean, default: false },
    exportLogisticsPrepared: { type: Boolean, default: false },
    
    // Verification Status
    verificationStatus: { type: String, default: "pending" },
    verificationSubmittedAt: { type: Date },
    verificationReviewedAt: { type: Date },
    verificationNotes: { type: String },
    verifiedDocuments: { type: [String], default: [] },
    changedFields: { type: [String], default: [] },
    
    // Auto-Verification Status (for documents verified via API/algorithm)
    autoVerified: {
      panNumber: {
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        details: { type: String },
      },
      gstNumber: {
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        details: { type: String },
      },
      aadharNumber: {
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        details: { type: String },
      },
      iecCode: {
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        details: { type: String },
      },
      bankIfscCode: {
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        bankName: { type: String },
        branchName: { type: String },
      },
      bankAccountNumber: {
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        details: { type: String },
      },
      fssaiLicenseNumber: {
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        details: { type: String },
      },
    },
    
    // Legacy fields
    gstCertificate: { type: String },
    panCard: { type: String },
    businessLicense: { type: String },
    canceledCheque: { type: String },
  },
  {
    timestamps: false,
  }
);

export const Documents = mongoose.model<IDocuments>("Documents", DocumentsSchema);
