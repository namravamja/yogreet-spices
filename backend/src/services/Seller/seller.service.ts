import { Seller } from "../../models/Seller";
import { BusinessAddress } from "../../models/BusinessAddress";
import { SocialLinks } from "../../models/SocialLinks";
import { Documents } from "../../models/Documents";
import { Review } from "../../models/Review";
import mongoose from "mongoose";
import { calculateDocumentCompletion } from "../../utils/calculateDocumentCompletion";

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
    const a = s?.businessAddressId;
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
  companyName?: string;
  mobile?: string;
  businessType?: string;
  productCategories?: string[];
  businessLogo?: string;
  about?: string;
  storePhotos?: string[];
  bankAccountHolderName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
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
  
  // Step 4: Shipping & Logistics
  shippingType?: string;
  serviceAreas?: string[];
  returnPolicy?: string;
  
  // Step 5: Export Documentation & Shipment Capability
  certificateOfOriginCapability?: boolean;
  phytosanitaryCertificateCapability?: boolean;
  packagingCompliance?: boolean;
  fumigationCertificateCapability?: boolean;
  exportLogisticsPrepared?: boolean;
  
  // Verification Status
  verificationStatus?: string;
  verificationNotes?: string;
  
  // Document Completion
  documentCompletion?: number;
}

export const getSellerById = async (id: string) => {
  const seller = await Seller.findById(id)
    .select("-password")
    .populate("businessAddressId")
    .populate("documentsId")
    .populate("socialLinksId")
    .populate({
      path: "reviews",
      select: "id rating title text date verified buyerId",
      populate: {
        path: "buyerId",
        select: "firstName lastName",
      },
    })
    .lean();
  
  if (!seller) throw new Error("Seller not found");
  
  const documents = seller.documentsId as any;
  const sellerData: any = {
    ...seller,
    id: seller._id.toString(),
    businessAddress: seller.businessAddressId,
    socialLinks: seller.socialLinksId,
    Review: (seller as any).reviews || [],
  };

  // Flatten document fields to root level for backward compatibility
  if (documents) {
    // Step 1: Business Identity Verification
    sellerData.panNumber = documents.panNumber || null;
    sellerData.gstNumber = documents.gstNumber || null;
    sellerData.ownerIdDocument = documents.ownerIdDocument || null;
    sellerData.incorporationCertificate = documents.incorporationCertificate || null;
    sellerData.msmeUdyamCertificate = documents.msmeUdyamCertificate || null;
    sellerData.businessAddressProof = documents.businessAddressProof || null;
    sellerData.aadharNumber = documents.aadharNumber || null;

    // Step 2: Export Eligibility Verification
    sellerData.iecCode = documents.iecCode || null;
    sellerData.iecCertificate = documents.iecCertificate || null;
    sellerData.apedaRegistrationNumber = documents.apedaRegistrationNumber || null;
    sellerData.apedaCertificate = documents.apedaCertificate || null;
    sellerData.spicesBoardRegistrationNumber = documents.spicesBoardRegistrationNumber || null;
    sellerData.spicesBoardCertificate = documents.spicesBoardCertificate || null;
    sellerData.tradeLicense = documents.tradeLicense || null;
    sellerData.bankAccountHolderName = documents.bankAccountHolderName || null;
    sellerData.bankAccountNumber = documents.bankAccountNumber || null;
    sellerData.bankIfscCode = documents.bankIfscCode || null;
    sellerData.bankProofDocument = documents.bankProofDocument || null;

    // Step 3: Food & Safety Compliance
    sellerData.fssaiLicenseNumber = documents.fssaiLicenseNumber || null;
    sellerData.fssaiCertificate = documents.fssaiCertificate || null;
    sellerData.foodQualityCertifications = documents.foodQualityCertifications || [];
    sellerData.labTestingCapability = documents.labTestingCapability !== undefined ? documents.labTestingCapability : false;

    // Step 4: Shipping & Logistics
    sellerData.shippingType = documents.shippingType || null;
    sellerData.serviceAreas = documents.serviceAreas || [];
    sellerData.returnPolicy = documents.returnPolicy || null;

    // Step 5: Export Documentation & Shipment Capability
    sellerData.certificateOfOriginCapability = documents.certificateOfOriginCapability !== undefined ? documents.certificateOfOriginCapability : false;
    sellerData.phytosanitaryCertificateCapability = documents.phytosanitaryCertificateCapability !== undefined ? documents.phytosanitaryCertificateCapability : false;
    sellerData.packagingCompliance = documents.packagingCompliance !== undefined ? documents.packagingCompliance : false;
    sellerData.fumigationCertificateCapability = documents.fumigationCertificateCapability !== undefined ? documents.fumigationCertificateCapability : false;
    sellerData.exportLogisticsPrepared = documents.exportLogisticsPrepared !== undefined ? documents.exportLogisticsPrepared : false;

    // Verification Status
    sellerData.verificationStatus = documents.verificationStatus || "pending";
    sellerData.verificationSubmittedAt = documents.verificationSubmittedAt || null;
    sellerData.verificationReviewedAt = documents.verificationReviewedAt || null;
    sellerData.verificationNotes = documents.verificationNotes || null;
    sellerData.verifiedDocuments = documents.verifiedDocuments || [];
    sellerData.changedFields = documents.changedFields || [];
  } else {
    // Initialize empty document fields if documents don't exist
    sellerData.panNumber = null;
    sellerData.gstNumber = null;
    sellerData.ownerIdDocument = null;
    sellerData.incorporationCertificate = null;
    sellerData.msmeUdyamCertificate = null;
    sellerData.businessAddressProof = null;
    sellerData.aadharNumber = null;
    sellerData.iecCode = null;
    sellerData.iecCertificate = null;
    sellerData.apedaRegistrationNumber = null;
    sellerData.apedaCertificate = null;
    sellerData.spicesBoardRegistrationNumber = null;
    sellerData.spicesBoardCertificate = null;
    sellerData.tradeLicense = null;
    sellerData.bankAccountHolderName = null;
    sellerData.bankAccountNumber = null;
    sellerData.bankIfscCode = null;
    sellerData.bankProofDocument = null;
    sellerData.fssaiLicenseNumber = null;
    sellerData.fssaiCertificate = null;
    sellerData.foodQualityCertifications = [];
    sellerData.labTestingCapability = false;
    sellerData.shippingType = null;
    sellerData.serviceAreas = [];
    sellerData.returnPolicy = null;
    sellerData.certificateOfOriginCapability = false;
    sellerData.phytosanitaryCertificateCapability = false;
    sellerData.packagingCompliance = false;
    sellerData.fumigationCertificateCapability = false;
    sellerData.exportLogisticsPrepared = false;
    sellerData.verificationStatus = "pending";
    sellerData.verificationSubmittedAt = null;
    sellerData.verificationReviewedAt = null;
    sellerData.verificationNotes = null;
    sellerData.verifiedDocuments = [];
    sellerData.changedFields = [];
  }

  // Also include documents object for reference
  sellerData.documents = documents;

  return sellerData;
};

export const updateSeller = async (id: string, data: SellerUpdateData) => {
  // Get current seller data to compare changes
  const currentSeller = await Seller.findById(id)
    .select("-password")
    .populate("businessAddressId")
    .populate("documentsId")
    .populate("socialLinksId")
    .lean();
  
  if (!currentSeller) throw new Error("Seller not found");

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

  // Track changed fields for profile information
  const changedFields: string[] = [];
  const profileFields = [
    "fullName", "companyName", "mobile", "businessType", "productCategories",
    "businessLogo", "about", "storePhotos", "bankAccountHolderName", "bankName",
    "bankAccountNumber", "bankIfscCode", "upiId", "gstNumber", "panNumber"
  ];

  profileFields.forEach(field => {
    if (cleanData[field] !== undefined) {
      const oldValue = (currentSeller as any)[field];
      const newValue = cleanData[field];
      
      // Compare values (handle arrays specially)
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort())) {
          changedFields.push(field);
        }
      } else if (oldValue !== newValue) {
        changedFields.push(field);
      }
    }
  });

  // Track business address changes
  if (businessAddress) {
    const currentAddress = currentSeller.businessAddressId as any;
    if (currentAddress) {
      if (businessAddress.street !== undefined && businessAddress.street !== currentAddress.street) {
        changedFields.push("businessAddress.street");
      }
      if (businessAddress.city !== undefined && businessAddress.city !== currentAddress.city) {
        changedFields.push("businessAddress.city");
      }
      if (businessAddress.state !== undefined && businessAddress.state !== currentAddress.state) {
        changedFields.push("businessAddress.state");
      }
      if (businessAddress.country !== undefined && businessAddress.country !== currentAddress.country) {
        changedFields.push("businessAddress.country");
      }
      if (businessAddress.pinCode !== undefined && businessAddress.pinCode !== currentAddress.pinCode) {
        changedFields.push("businessAddress.pinCode");
      }
    } else if (businessAddress.street) {
      // New address being created
      changedFields.push("businessAddress");
    }
  }

  // Track social links changes
  if (socialLinks) {
    const currentSocialLinks = currentSeller.socialLinksId as any;
    if (currentSocialLinks) {
      if (socialLinks.website !== undefined && socialLinks.website !== currentSocialLinks.website) {
        changedFields.push("socialLinks.website");
      }
      if (socialLinks.instagram !== undefined && socialLinks.instagram !== currentSocialLinks.instagram) {
        changedFields.push("socialLinks.instagram");
      }
      if (socialLinks.facebook !== undefined && socialLinks.facebook !== currentSocialLinks.facebook) {
        changedFields.push("socialLinks.facebook");
      }
      if (socialLinks.twitter !== undefined && socialLinks.twitter !== currentSocialLinks.twitter) {
        changedFields.push("socialLinks.twitter");
      }
    } else {
      // New social links being created
      changedFields.push("socialLinks");
    }
  }

  // Handle nested relations
  const updatePayload: any = cleanData;

  // Update or create business address
  if (businessAddress) {
    const seller = await Seller.findById(id).select("businessAddressId").lean();
    if (seller?.businessAddressId) {
      // Update only provided fields
      const dataToUpdate: any = {};
      if (businessAddress.street !== undefined) dataToUpdate.street = businessAddress.street;
      if (businessAddress.city !== undefined) dataToUpdate.city = businessAddress.city ?? null;
      if (businessAddress.state !== undefined) dataToUpdate.state = businessAddress.state ?? null;
      if (businessAddress.country !== undefined) dataToUpdate.country = businessAddress.country ?? null;
      if (businessAddress.pinCode !== undefined) dataToUpdate.pinCode = businessAddress.pinCode ?? null;
      if (Object.keys(dataToUpdate).length > 0) {
        await BusinessAddress.findByIdAndUpdate(seller.businessAddressId, { $set: dataToUpdate });
      }
    } else if (businessAddress.street) {
      // Create only if street provided (required)
      const newAddress = await BusinessAddress.create({
        street: businessAddress.street,
        city: businessAddress.city ?? null,
        state: businessAddress.state ?? null,
        country: businessAddress.country ?? null,
        pinCode: businessAddress.pinCode ?? null,
      } as any);
      updatePayload.businessAddressId = (newAddress as any)._id;
    }
  }

  // Update or create social links
  if (socialLinks) {
    const seller = await Seller.findById(id).select("socialLinksId").lean();
    if (seller?.socialLinksId) {
      await SocialLinks.findByIdAndUpdate(seller.socialLinksId, { $set: socialLinks });
    } else {
      const newLinks = await SocialLinks.create(socialLinks);
      updatePayload.socialLinksId = newLinks._id;
    }
  }

  // Update changedFields in Documents if there are any changes
  if (changedFields.length > 0 && currentSeller.documentsId) {
    const currentDocuments = await Documents.findById(currentSeller.documentsId).lean() as any;
    const existingChangedFields = currentDocuments?.changedFields || [];
    
    // Add new changed fields (avoid duplicates)
    const updatedChangedFields = [...new Set([...existingChangedFields, ...changedFields])];
    
    await Documents.findByIdAndUpdate(
      currentSeller.documentsId,
      { $set: { changedFields: updatedChangedFields } },
      { new: true }
    );
  }

  const updatedSeller = await Seller.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true }
  )
    .select("-password")
    .populate("businessAddressId")
    .populate("documentsId")
    .populate("socialLinksId")
    .populate({
      path: "reviews",
      select: "id rating title text date verified buyerId",
      populate: {
        path: "buyerId",
        select: "firstName lastName",
      },
    })
    .lean();
  
  if (!updatedSeller) throw new Error("Seller not found");
  
  // Compute and persist profile completion if changed
  const sellerWithAddress = {
    ...updatedSeller,
    businessAddress: updatedSeller.businessAddressId,
  };
  const percent = computeProfileCompletion(sellerWithAddress);
  if (typeof percent === "number" && percent !== updatedSeller.profileCompletion) {
    const finalSeller = await Seller.findByIdAndUpdate(
      id,
      { $set: { profileCompletion: percent } },
      { new: true }
    )
      .select("-password")
      .populate("businessAddressId")
      .populate("documentsId")
      .populate("socialLinksId")
      .populate({
        path: "reviews",
        select: "id rating title text date verified buyerId",
        populate: {
          path: "buyerId",
          select: "firstName lastName",
        },
      })
      .lean();
    
    return {
      ...finalSeller,
      id: finalSeller!._id.toString(),
      businessAddress: finalSeller!.businessAddressId,
      documents: finalSeller!.documentsId,
      socialLinks: finalSeller!.socialLinksId,
      Review: (finalSeller as any).reviews || [],
    };
  }
  
  return {
    ...updatedSeller,
    id: updatedSeller._id.toString(),
    businessAddress: updatedSeller.businessAddressId,
    documents: updatedSeller.documentsId,
    socialLinks: updatedSeller.socialLinksId,
    Review: (updatedSeller as any).reviews || [],
  };
};

export const updateSellerVerification = async (id: string, data: SellerVerificationData & { [key: string]: any }) => {
  // Extract potential extras sent by clients
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

  // Separate document fields from seller fields
  const documentFields = [
    "panNumber", "gstNumber", "ownerIdDocument", "incorporationCertificate",
    "msmeUdyamCertificate", "businessAddressProof", "aadharNumber",
    "iecCode", "iecCertificate", "apedaRegistrationNumber", "apedaCertificate",
    "spicesBoardRegistrationNumber", "spicesBoardCertificate", "tradeLicense",
    "bankAccountHolderName", "bankAccountNumber", "bankIfscCode", "bankProofDocument",
    "fssaiLicenseNumber", "fssaiCertificate", "foodQualityCertifications", "labTestingCapability",
    "shippingType", "serviceAreas", "returnPolicy",
    "certificateOfOriginCapability", "phytosanitaryCertificateCapability",
    "packagingCompliance", "fumigationCertificateCapability", "exportLogisticsPrepared",
    "verificationStatus", "verificationSubmittedAt", "verificationReviewedAt", "verificationNotes"
  ];

  const documentsPayload: any = {};
  const sellerUpdatePayload: any = {};

  // Separate document fields from seller fields
  documentFields.forEach(field => {
    if (cleanData[field] !== undefined) {
      documentsPayload[field] = cleanData[field];
      delete cleanData[field];
    }
  });

  // Remaining cleanData goes to seller (if any non-document fields)
  Object.keys(cleanData).forEach(key => {
    if (!documentFields.includes(key)) {
      sellerUpdatePayload[key] = cleanData[key];
    }
  });

  // If client sent an object businessAddress, update/create nested BusinessAddress
  if (businessAddress && typeof businessAddress === "object") {
    const current = await Seller.findById(id).select("businessAddressId").lean();
    if (current?.businessAddressId) {
      const toUpdate: any = {};
      if (businessAddress.street !== undefined) toUpdate.street = businessAddress.street;
      if (businessAddress.city !== undefined) toUpdate.city = businessAddress.city ?? null;
      if (businessAddress.state !== undefined) toUpdate.state = businessAddress.state ?? null;
      if (businessAddress.country !== undefined) toUpdate.country = businessAddress.country ?? null;
      if (businessAddress.pinCode !== undefined) toUpdate.pinCode = businessAddress.pinCode ?? null;
      if (Object.keys(toUpdate).length > 0) {
        await BusinessAddress.findByIdAndUpdate(current.businessAddressId, { $set: toUpdate });
      }
    } else if (businessAddress.street) {
      const newAddress = await BusinessAddress.create({
        street: businessAddress.street,
        city: businessAddress.city ?? null,
        state: businessAddress.state ?? null,
        country: businessAddress.country ?? null,
        pinCode: businessAddress.pinCode ?? null,
      } as any);
      sellerUpdatePayload.businessAddressId = (newAddress as any)._id;
    }
  }

  // Get or create Documents record
  const seller = await Seller.findById(id).select("documentsId").lean();
  let documentsId = seller?.documentsId;

  if (!documentsId) {
    // Create new Documents record
    const newDocuments = await Documents.create({} as any) as any;
    documentsId = newDocuments._id;
    sellerUpdatePayload.documentsId = documentsId;
  }

  // Get current documents to check verifiedDocuments and current values
  const currentDocuments = await Documents.findById(documentsId).lean() as any;
  const currentVerifiedDocuments = currentDocuments?.verifiedDocuments || [];
  const currentChangedFields = currentDocuments?.changedFields || [];

  // Track changed fields for document updates
  const changedFields: string[] = [];
  
  // Check which fields are being changed
  Object.keys(documentsPayload).forEach(field => {
    // Skip verification-related fields from change tracking
    if (field === "verificationStatus" || field === "verificationSubmittedAt" || 
        field === "verificationReviewedAt" || field === "verificationNotes" ||
        field === "verifiedDocuments" || field === "changedFields") {
      return;
    }
    
    const oldValue = currentDocuments?.[field];
    const newValue = documentsPayload[field];
    
    // Compare values (handle arrays and booleans specially)
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort())) {
        changedFields.push(field);
      }
    } else if (typeof oldValue === "boolean" && typeof newValue === "boolean") {
      if (oldValue !== newValue) {
        changedFields.push(field);
      }
    } else {
      // For strings and other types, compare directly
      const oldStr = oldValue ? String(oldValue) : "";
      const newStr = newValue ? String(newValue) : "";
      if (oldStr !== newStr) {
        changedFields.push(field);
      }
    }
  });

  // List of document fields that can be verified
  const verifiableDocumentFields = [
    "ownerIdDocument",
    "incorporationCertificate",
    "msmeUdyamCertificate",
    "businessAddressProof",
    "iecCertificate",
    "apedaCertificate",
    "spicesBoardCertificate",
    "tradeLicense",
    "bankProofDocument",
    "fssaiCertificate",
    "profileInformation",
    "shippingLogistics",
    "exportDocumentation"
  ];

  // Check which document fields are being removed or modified
  const fieldsToUnverify: string[] = [];
  
  verifiableDocumentFields.forEach(field => {
    if (field in documentsPayload) {
      const newValue = documentsPayload[field];
      const oldValue = currentDocuments?.[field];
      
      // If field is being set to null/undefined/empty string (removed), remove from verifiedDocuments
      if (newValue === null || newValue === undefined || newValue === "" || newValue === "null") {
        if (currentVerifiedDocuments.includes(field)) {
          fieldsToUnverify.push(field);
        }
      } else if (oldValue !== undefined && oldValue !== null && oldValue !== "" && oldValue !== newValue) {
        // If document value is being changed (modified), remove from verifiedDocuments
        // Admin needs to re-verify after modification
        if (currentVerifiedDocuments.includes(field)) {
          fieldsToUnverify.push(field);
        }
      }
    }
  });

  // Remove unverified fields from verifiedDocuments array
  if (fieldsToUnverify.length > 0) {
    documentsPayload.verifiedDocuments = currentVerifiedDocuments.filter(
      (doc: string) => !fieldsToUnverify.includes(doc)
    );
  }

  // Add changed fields to changedFields array (avoid duplicates)
  if (changedFields.length > 0) {
    const updatedChangedFields = [...new Set([...currentChangedFields, ...changedFields])];
    documentsPayload.changedFields = updatedChangedFields;
  }

  // Update verification status and timestamps if needed
  if (documentsPayload.verificationStatus === "pending" || (!documentsPayload.verificationStatus && !currentDocuments?.verificationStatus)) {
    documentsPayload.verificationStatus = "pending";
    documentsPayload.verificationSubmittedAt = new Date();
  }

  // Update Documents record
  if (Object.keys(documentsPayload).length > 0) {
    await Documents.findByIdAndUpdate(documentsId, { $set: documentsPayload }, { new: true });
  }

  // Calculate document completion from updated documents
  const updatedDocuments = await Documents.findById(documentsId).lean() as any;
  const documentCompletion = calculateDocumentCompletion(updatedDocuments);
  
  // Update seller with documentCompletion
  sellerUpdatePayload.documentCompletion = documentCompletion;

  // Update Seller record if there are any seller-level changes
  if (Object.keys(sellerUpdatePayload).length > 0) {
    await Seller.findByIdAndUpdate(id, { $set: sellerUpdatePayload }, { new: true });
  }

  // Fetch updated seller with populated documents
  const updatedSeller = await Seller.findById(id)
    .select("-password")
    .populate("businessAddressId")
    .populate("documentsId")
    .populate("socialLinksId")
    .lean();
  
  if (!updatedSeller) throw new Error("Seller not found");
  
  const documents = updatedSeller.documentsId as any;
  const sellerData: any = {
    ...updatedSeller,
    id: updatedSeller._id.toString(),
    businessAddress: updatedSeller.businessAddressId,
    socialLinks: updatedSeller.socialLinksId,
  };

  // Flatten document fields to root level for backward compatibility
  if (documents) {
    // Step 1: Business Identity Verification
    sellerData.panNumber = documents.panNumber || null;
    sellerData.gstNumber = documents.gstNumber || null;
    sellerData.ownerIdDocument = documents.ownerIdDocument || null;
    sellerData.incorporationCertificate = documents.incorporationCertificate || null;
    sellerData.msmeUdyamCertificate = documents.msmeUdyamCertificate || null;
    sellerData.businessAddressProof = documents.businessAddressProof || null;
    sellerData.aadharNumber = documents.aadharNumber || null;

    // Step 2: Export Eligibility Verification
    sellerData.iecCode = documents.iecCode || null;
    sellerData.iecCertificate = documents.iecCertificate || null;
    sellerData.apedaRegistrationNumber = documents.apedaRegistrationNumber || null;
    sellerData.apedaCertificate = documents.apedaCertificate || null;
    sellerData.spicesBoardRegistrationNumber = documents.spicesBoardRegistrationNumber || null;
    sellerData.spicesBoardCertificate = documents.spicesBoardCertificate || null;
    sellerData.tradeLicense = documents.tradeLicense || null;
    sellerData.bankAccountHolderName = documents.bankAccountHolderName || null;
    sellerData.bankAccountNumber = documents.bankAccountNumber || null;
    sellerData.bankIfscCode = documents.bankIfscCode || null;
    sellerData.bankProofDocument = documents.bankProofDocument || null;

    // Step 3: Food & Safety Compliance
    sellerData.fssaiLicenseNumber = documents.fssaiLicenseNumber || null;
    sellerData.fssaiCertificate = documents.fssaiCertificate || null;
    sellerData.foodQualityCertifications = documents.foodQualityCertifications || [];
    sellerData.labTestingCapability = documents.labTestingCapability !== undefined ? documents.labTestingCapability : false;

    // Step 4: Shipping & Logistics
    sellerData.shippingType = documents.shippingType || null;
    sellerData.serviceAreas = documents.serviceAreas || [];
    sellerData.returnPolicy = documents.returnPolicy || null;

    // Step 5: Export Documentation & Shipment Capability
    sellerData.certificateOfOriginCapability = documents.certificateOfOriginCapability !== undefined ? documents.certificateOfOriginCapability : false;
    sellerData.phytosanitaryCertificateCapability = documents.phytosanitaryCertificateCapability !== undefined ? documents.phytosanitaryCertificateCapability : false;
    sellerData.packagingCompliance = documents.packagingCompliance !== undefined ? documents.packagingCompliance : false;
    sellerData.fumigationCertificateCapability = documents.fumigationCertificateCapability !== undefined ? documents.fumigationCertificateCapability : false;
    sellerData.exportLogisticsPrepared = documents.exportLogisticsPrepared !== undefined ? documents.exportLogisticsPrepared : false;

    // Verification Status
    sellerData.verificationStatus = documents.verificationStatus || "pending";
    sellerData.verificationSubmittedAt = documents.verificationSubmittedAt || null;
    sellerData.verificationReviewedAt = documents.verificationReviewedAt || null;
    sellerData.verificationNotes = documents.verificationNotes || null;
    sellerData.verifiedDocuments = documents.verifiedDocuments || [];
    sellerData.changedFields = documents.changedFields || [];
  } else {
    // Initialize empty document fields if documents don't exist
    sellerData.panNumber = null;
    sellerData.gstNumber = null;
    sellerData.ownerIdDocument = null;
    sellerData.incorporationCertificate = null;
    sellerData.msmeUdyamCertificate = null;
    sellerData.businessAddressProof = null;
    sellerData.aadharNumber = null;
    sellerData.iecCode = null;
    sellerData.iecCertificate = null;
    sellerData.apedaRegistrationNumber = null;
    sellerData.apedaCertificate = null;
    sellerData.spicesBoardRegistrationNumber = null;
    sellerData.spicesBoardCertificate = null;
    sellerData.tradeLicense = null;
    sellerData.bankAccountHolderName = null;
    sellerData.bankAccountNumber = null;
    sellerData.bankIfscCode = null;
    sellerData.bankProofDocument = null;
    sellerData.fssaiLicenseNumber = null;
    sellerData.fssaiCertificate = null;
    sellerData.foodQualityCertifications = [];
    sellerData.labTestingCapability = false;
    sellerData.shippingType = null;
    sellerData.serviceAreas = [];
    sellerData.returnPolicy = null;
    sellerData.certificateOfOriginCapability = false;
    sellerData.phytosanitaryCertificateCapability = false;
    sellerData.packagingCompliance = false;
    sellerData.fumigationCertificateCapability = false;
    sellerData.exportLogisticsPrepared = false;
    sellerData.verificationStatus = "pending";
    sellerData.verificationSubmittedAt = null;
    sellerData.verificationReviewedAt = null;
    sellerData.verificationNotes = null;
    sellerData.verifiedDocuments = [];
    sellerData.changedFields = [];
  }

  // Also include documents object for reference
  sellerData.documents = documents;

  return sellerData;
};

export const getSellerVerification = async (id: string) => {
  const seller = await Seller.findById(id)
    .populate("documentsId")
    .select("documentsId documentCompletion")
    .lean();
  
  if (!seller) throw new Error("Seller not found");

  const documents = seller.documentsId as any;
  
  // Return document fields at root level for backward compatibility
  return {
    ...documents,
    id: seller._id.toString(),
    documentCompletion: seller.documentCompletion,
  };
};
