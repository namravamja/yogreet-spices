import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SellerUpdateData {
  fullName?: string;
  companyName?: string; // Merged from storeName and companyName
  mobile?: string;
  businessType?: string;
  productCategories?: string[];
  businessLogo?: string;
  bankAccountHolderName?: string; // Merged from bankAccountName and bankAccountHolderName
  bankName?: string;
  bankAccountNumber?: string; // Merged from accountNumber and bankAccountNumber
  bankIfscCode?: string; // Merged from ifscCode and bankIfscCode
  upiId?: string;
  gstNumber?: string;
  panNumber?: string;
  shippingType?: string;
  serviceAreas?: string[];
  returnPolicy?: string;
  
  // Address data
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
  };
  warehouseAddress?: {
    sameAsBusiness?: boolean;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;
  };
  
  // Social links
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface SellerVerificationData {
  // Step 1: Business Identity Verification
  companyName?: string; // Merged from storeName and companyName
  incorporationCertificate?: string;
  msmeUdyamCertificate?: string;
  businessAddressProof?: string;
  fullName?: string; // Merged from fullName and ownerFullName (owner is the seller)
  ownerIdDocument?: string;
  ownerIdNumber?: string;
  
  // Step 2: Export Eligibility Verification
  iecCode?: string;
  iecCertificate?: string;
  apedaRegistrationNumber?: string;
  apedaCertificate?: string;
  spicesBoardRegistrationNumber?: string;
  spicesBoardCertificate?: string;
  tradeLicense?: string;
  bankAccountHolderName?: string; // Merged from bankAccountName and bankAccountHolderName
  bankAccountNumber?: string; // Merged from accountNumber and bankAccountNumber
  bankIfscCode?: string; // Merged from ifscCode and bankIfscCode
  bankProofDocument?: string;
  
  // Step 3: Food & Safety Compliance
  fssaiLicenseNumber?: string;
  fssaiCertificate?: string;
  foodQualityCertifications?: string[];
  labTestingCapability?: boolean;
  sampleLabTestCertificate?: string;
  
  // Step 4: Export Documentation & Shipment Capability
  certificateOfOriginCapability?: boolean;
  phytosanitaryCertificateCapability?: boolean;
  packagingCompliance?: boolean;
  fumigationCertificateCapability?: boolean;
  exportLogisticsPrepared?: boolean;
  
  // Verification Status
  verificationStatus?: string;
  verificationNotes?: string;
}

const defaultSelect = {
  password: false,
  id: true,
  email: true,
  fullName: true,
  companyName: true, // Merged from storeName and companyName
  mobile: true,
  businessType: true,
  productCategories: true,
  businessLogo: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  isAuthenticated: true,
  businessAddress: {
    select: {
      id: true,
      street: true,
      city: true,
      state: true,
      country: true,
      pinCode: true,
    },
  },
  warehouseAddress: {
    select: {
      id: true,
      street: true,
      sameAsBusiness: true,
      city: true,
      state: true,
      country: true,
      pinCode: true,
    },
  },
  documents: {
    select: {
      id: true,
      gstCertificate: true,
      panCard: true,
      businessLicense: true,
      canceledCheque: true,
    },
  },
  socialLinks: {
    select: {
      id: true,
      website: true,
      instagram: true,
      facebook: true,
      twitter: true,
    },
  },
  bankAccountHolderName: true, // Merged from bankAccountName and bankAccountHolderName
  bankName: true,
  bankAccountNumber: true, // Merged from accountNumber and bankAccountNumber
  bankIfscCode: true, // Merged from ifscCode and bankIfscCode
  upiId: true,
  gstNumber: true,
  panNumber: true,
  shippingType: true,
  serviceAreas: true,
  returnPolicy: true,
  // Verification fields (companyName, bankAccountHolderName, bankAccountNumber, bankIfscCode already included above)
  incorporationCertificate: true,
  msmeUdyamCertificate: true,
  businessAddressProof: true,
  ownerIdDocument: true,
  ownerIdNumber: true,
  iecCode: true,
  iecCertificate: true,
  apedaRegistrationNumber: true,
  apedaCertificate: true,
  spicesBoardRegistrationNumber: true,
  spicesBoardCertificate: true,
  tradeLicense: true,
  bankProofDocument: true,
  fssaiLicenseNumber: true,
  fssaiCertificate: true,
  foodQualityCertifications: true,
  labTestingCapability: true,
  sampleLabTestCertificate: true,
  certificateOfOriginCapability: true,
  phytosanitaryCertificateCapability: true,
  packagingCompliance: true,
  fumigationCertificateCapability: true,
  exportLogisticsPrepared: true,
  verificationStatus: true,
  verificationSubmittedAt: true,
  verificationReviewedAt: true,
  verificationNotes: true,
};

export const getSellerById = async (id: string) => {
  const seller = await prisma.seller.findUnique({
    where: { id },
    select: defaultSelect,
  });
  if (!seller) throw new Error("Seller not found");
  return seller;
};

export const updateSeller = async (id: string, data: SellerUpdateData) => {
  // Separate nested relations
  const { businessAddress, warehouseAddress, socialLinks, ...sellerData } = data;
  
  // Clean up undefined/null values from seller data
  const cleanData: any = {};
  Object.keys(sellerData).forEach(key => {
    const value = sellerData[key as keyof typeof sellerData];
    if (value !== undefined && value !== null) {
      cleanData[key] = value;
    }
  });

  // Handle nested relations
  const updatePayload: any = cleanData;

  // Update or create business address
  if (businessAddress && businessAddress.street) {
    const seller = await prisma.seller.findUnique({ where: { id }, select: { businessAddressId: true } });
    if (seller?.businessAddressId) {
      await prisma.businessAddress.update({
        where: { id: seller.businessAddressId },
        data: {
          street: businessAddress.street,
          city: businessAddress.city || null,
          state: businessAddress.state || null,
          country: businessAddress.country || null,
          pinCode: businessAddress.pinCode || null,
        },
      });
    } else {
      const newAddress = await prisma.businessAddress.create({
        data: {
          street: businessAddress.street,
          city: businessAddress.city || null,
          state: businessAddress.state || null,
          country: businessAddress.country || null,
          pinCode: businessAddress.pinCode || null,
        },
      });
      updatePayload.businessAddressId = newAddress.id;
    }
  }

  // Update or create warehouse address
  if (warehouseAddress && warehouseAddress.street) {
    const seller = await prisma.seller.findUnique({ where: { id }, select: { warehouseAddressId: true } });
    if (seller?.warehouseAddressId) {
      await prisma.warehouseAddress.update({
        where: { id: seller.warehouseAddressId },
        data: {
          street: warehouseAddress.street,
          sameAsBusiness: warehouseAddress.sameAsBusiness ?? null,
          city: warehouseAddress.city || null,
          state: warehouseAddress.state || null,
          country: warehouseAddress.country || null,
          pinCode: warehouseAddress.pinCode || null,
        },
      });
    } else {
      const newAddress = await prisma.warehouseAddress.create({
        data: {
          street: warehouseAddress.street,
          sameAsBusiness: warehouseAddress.sameAsBusiness ?? null,
          city: warehouseAddress.city || null,
          state: warehouseAddress.state || null,
          country: warehouseAddress.country || null,
          pinCode: warehouseAddress.pinCode || null,
        },
      });
      updatePayload.warehouseAddressId = newAddress.id;
    }
  }

  // Update or create social links
  if (socialLinks) {
    const seller = await prisma.seller.findUnique({ where: { id }, select: { socialLinksId: true } });
    if (seller?.socialLinksId) {
      await prisma.socialLinks.update({
        where: { id: seller.socialLinksId },
        data: socialLinks,
      });
    } else {
      const newLinks = await prisma.socialLinks.create({ data: socialLinks });
      updatePayload.socialLinksId = newLinks.id;
    }
  }

  const seller = await prisma.seller.update({
    where: { id },
    data: updatePayload,
    select: defaultSelect,
  });
  return seller;
};

export const updateSellerVerification = async (id: string, data: SellerVerificationData) => {
  // Clean up undefined/null values
  const cleanData: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key as keyof SellerVerificationData];
    if (value !== undefined && value !== null) {
      cleanData[key] = value;
    }
  });

  // If verification is being submitted, set status and timestamp
  if (cleanData.verificationStatus === 'pending' || !cleanData.verificationStatus) {
    cleanData.verificationStatus = 'pending';
    cleanData.verificationSubmittedAt = new Date();
  }

  const seller = await prisma.seller.update({
    where: { id },
    data: cleanData,
    select: defaultSelect,
  });
  return seller;
};

export const getSellerVerification = async (id: string) => {
  const seller = await prisma.seller.findUnique({
    where: { id },
    select: {
      // Verification fields
      companyName: true, // Merged from storeName and companyName
      incorporationCertificate: true,
      msmeUdyamCertificate: true,
      businessAddressProof: true,
      fullName: true, // Merged from fullName and ownerFullName (owner is the seller)
      ownerIdDocument: true,
      ownerIdNumber: true,
      iecCode: true,
      iecCertificate: true,
      apedaRegistrationNumber: true,
      apedaCertificate: true,
      spicesBoardRegistrationNumber: true,
      spicesBoardCertificate: true,
      tradeLicense: true,
      bankAccountHolderName: true,
      bankAccountNumber: true,
      bankIfscCode: true,
      bankProofDocument: true,
      fssaiLicenseNumber: true,
      fssaiCertificate: true,
      foodQualityCertifications: true,
      labTestingCapability: true,
      sampleLabTestCertificate: true,
      certificateOfOriginCapability: true,
      phytosanitaryCertificateCapability: true,
      packagingCompliance: true,
      fumigationCertificateCapability: true,
      exportLogisticsPrepared: true,
      verificationStatus: true,
      verificationSubmittedAt: true,
      verificationReviewedAt: true,
      verificationNotes: true,
    },
  });
  if (!seller) throw new Error("Seller not found");
  return seller;
};

