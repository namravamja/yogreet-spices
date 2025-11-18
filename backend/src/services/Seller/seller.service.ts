import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function computeProfileCompletion(s: any): number {
  try {
    let completed = 0;
    const total = 13; // Basic (6) + About & Photos (2) + Address (5)
    // Basic
    if (s?.fullName) completed++;
    if (s?.companyName) completed++;
    if (s?.email) completed++;
    if (s?.mobile) completed++;
    if (s?.businessType) completed++;
    if (Array.isArray(s?.productCategories) && s.productCategories.length > 0) completed++;
    // About & Photos
    if (s?.about) completed++;
    if (Array.isArray(s?.storePhotos) && s.storePhotos.length > 0) completed++;
    // Address
    const a = s?.businessAddress;
    if (a?.street) completed++;
    if (a?.city) completed++;
    if (a?.state) completed++;
    if (a?.country) completed++;
    if (a?.pinCode) completed++;
    return Math.round((completed / total) * 100);
  } catch {
    return 0;
  }
}

export interface SellerUpdateData {
  fullName?: string;
  companyName?: string; // Merged from storeName and companyName
  mobile?: string;
  businessType?: string;
  productCategories?: string[];
  businessLogo?: string;
  about?: string;
  storePhotos?: string[];
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
  
  // Step 4: Export Documentation & Shipment Capability
  certificateOfOriginCapability?: boolean;
  phytosanitaryCertificateCapability?: boolean;
  packagingCompliance?: boolean;
  fumigationCertificateCapability?: boolean;
  exportLogisticsPrepared?: boolean;
  // Shipping & Logistics (moved from edit-profile to verification)
  shippingType?: string;
  serviceAreas?: string[];
  returnPolicy?: string;
  
  // Verification Status
  verificationStatus?: string;
  verificationNotes?: string;
  
  // Document Completion
  documentCompletion?: number;
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
  about: true,
  storePhotos: true,
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
  profileCompletion: true,
  documentCompletion: true,
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
  certificateOfOriginCapability: true,
  phytosanitaryCertificateCapability: true,
  packagingCompliance: true,
  fumigationCertificateCapability: true,
  exportLogisticsPrepared: true,
  verificationStatus: true,
  verificationSubmittedAt: true,
  verificationReviewedAt: true,
  verificationNotes: true,
  Review: {
    select: {
      id: true,
      rating: true,
      title: true,
      text: true,
      date: true,
      verified: true,
      buyer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
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
  const { businessAddress, socialLinks, ...sellerData } = data;
  
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
  if (businessAddress) {
    const seller = await prisma.seller.findUnique({ where: { id }, select: { businessAddressId: true } });
    if (seller?.businessAddressId) {
      // Update only provided fields (avoid overwriting with nulls when not sent)
      const dataToUpdate: any = {};
      if (businessAddress.street !== undefined) dataToUpdate.street = businessAddress.street;
      if (businessAddress.city !== undefined) dataToUpdate.city = businessAddress.city ?? null;
      if (businessAddress.state !== undefined) dataToUpdate.state = businessAddress.state ?? null;
      if (businessAddress.country !== undefined) dataToUpdate.country = businessAddress.country ?? null;
      if (businessAddress.pinCode !== undefined) dataToUpdate.pinCode = businessAddress.pinCode ?? null;
      if (Object.keys(dataToUpdate).length > 0) {
        await prisma.businessAddress.update({
          where: { id: seller.businessAddressId },
          data: dataToUpdate,
        });
      }
    } else if (businessAddress.street) {
      // Create only if street provided (required)
      const newAddress = await prisma.businessAddress.create({
        data: {
          street: businessAddress.street,
          city: businessAddress.city ?? null,
          state: businessAddress.state ?? null,
          country: businessAddress.country ?? null,
          pinCode: businessAddress.pinCode ?? null,
        },
      });
      updatePayload.businessAddressId = newAddress.id;
    }
  }

  // Update or create warehouse address
  // Warehouse address removed

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
  // Compute and persist profile completion if changed
  const percent = computeProfileCompletion(seller);
  if (typeof percent === "number" && percent !== (seller as any).profileCompletion) {
    const updated = await prisma.seller.update({
      where: { id },
      data: { profileCompletion: percent },
      select: defaultSelect,
    });
    return updated;
  }
  return seller as any;
};

export const updateSellerVerification = async (id: string, data: SellerVerificationData & { [key: string]: any }) => {
  // Extract potential extras sent by clients
  // Some clients may send ownerFullName or businessAddress (string/object)
  const { ownerFullName, businessAddress, ...rest } = data as any;

  // Clean up undefined/null values from remaining data
  const cleanData: any = {};
  Object.keys(rest).forEach((key) => {
    const value = (rest as any)[key];
    if (value !== undefined && value !== null) {
      cleanData[key] = value;
    }
  });

  // Map ownerFullName -> fullName if provided and fullName not already present
  if (ownerFullName && !cleanData.fullName) {
    cleanData.fullName = ownerFullName;
  }

  // Ensure we never pass an invalid scalar for a relational field
  // If client sent a plain string businessAddress, ignore it here
  if (typeof businessAddress === "string") {
    // No-op: do not attach to cleanData
  }

  // If client sent an object businessAddress, update/create nested BusinessAddress
  const updatePayload: any = { ...cleanData };
  if (businessAddress && typeof businessAddress === "object") {
    const current = await prisma.seller.findUnique({
      where: { id },
      select: { businessAddressId: true },
    });
    if (current?.businessAddressId) {
      const toUpdate: any = {};
      if (businessAddress.street !== undefined) toUpdate.street = businessAddress.street;
      if (businessAddress.city !== undefined) toUpdate.city = businessAddress.city ?? null;
      if (businessAddress.state !== undefined) toUpdate.state = businessAddress.state ?? null;
      if (businessAddress.country !== undefined) toUpdate.country = businessAddress.country ?? null;
      if (businessAddress.pinCode !== undefined) toUpdate.pinCode = businessAddress.pinCode ?? null;
      if (Object.keys(toUpdate).length > 0) {
        await prisma.businessAddress.update({
          where: { id: current.businessAddressId },
          data: toUpdate,
        });
      }
    } else if (businessAddress.street) {
      const newAddress = await prisma.businessAddress.create({
        data: {
          street: businessAddress.street,
          city: businessAddress.city ?? null,
          state: businessAddress.state ?? null,
          country: businessAddress.country ?? null,
          pinCode: businessAddress.pinCode ?? null,
        },
      });
      updatePayload.businessAddressId = newAddress.id;
    }
  }

  // If verification is being submitted or unspecified, set status and timestamp
  if (updatePayload.verificationStatus === "pending" || !updatePayload.verificationStatus) {
    updatePayload.verificationStatus = "pending";
    updatePayload.verificationSubmittedAt = new Date();
  }

  const seller = await prisma.seller.update({
    where: { id },
    data: updatePayload,
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
      certificateOfOriginCapability: true,
      phytosanitaryCertificateCapability: true,
      packagingCompliance: true,
      fumigationCertificateCapability: true,
      exportLogisticsPrepared: true,
      verificationStatus: true,
      verificationSubmittedAt: true,
      verificationReviewedAt: true,
      verificationNotes: true,
      documentCompletion: true,
    },
  });
  if (!seller) throw new Error("Seller not found");
  return seller;
};

