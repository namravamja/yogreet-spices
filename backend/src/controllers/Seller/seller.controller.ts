import { Request, Response } from "express";
import * as sellerService from "../../services/Seller/seller.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] };
}

export const getSeller = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const seller = await sellerService.getSellerById(userId);
    // Match reference format: return seller data directly (similar to buyer)
    res.json(seller);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

export const updateSeller = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Prepare update data from body
    const updateData: any = { ...req.body };

    // Backward compatibility: Map old field names to new merged field names
    if (updateData.storeName && !updateData.companyName) {
      updateData.companyName = updateData.storeName;
      delete updateData.storeName;
    }
    if (updateData.bankAccountName && !updateData.bankAccountHolderName) {
      updateData.bankAccountHolderName = updateData.bankAccountName;
      delete updateData.bankAccountName;
    }
    if (updateData.accountNumber && !updateData.bankAccountNumber) {
      updateData.bankAccountNumber = updateData.accountNumber;
      delete updateData.accountNumber;
    }
    if (updateData.ifscCode && !updateData.bankIfscCode) {
      updateData.bankIfscCode = updateData.ifscCode;
      delete updateData.ifscCode;
    }

    // If an image was uploaded (business logo), use the Cloudinary URL from multer
    if (req.file) {
      // Multer with CloudinaryStorage sets req.file.path to the Cloudinary URL
      updateData.businessLogo = (req.file as any).path || (req.file as any).location || req.file.path;
    }

    // Handle nested objects from FormData (they come as JSON strings)
    if (typeof updateData.businessAddress === 'string') {
      try {
        updateData.businessAddress = JSON.parse(updateData.businessAddress);
      } catch {
        // If parsing fails, keep as string (shouldn't happen)
      }
    }
    if (typeof updateData.warehouseAddress === 'string') {
      try {
        updateData.warehouseAddress = JSON.parse(updateData.warehouseAddress);
      } catch {
        // If parsing fails, keep as string (shouldn't happen)
      }
    }
    if (typeof updateData.socialLinks === 'string') {
      try {
        updateData.socialLinks = JSON.parse(updateData.socialLinks);
      } catch {
        // If parsing fails, keep as string (shouldn't happen)
      }
    }

    // Handle productCategories if it's a string (convert to array)
    if (updateData.productCategories !== undefined) {
      if (typeof updateData.productCategories === 'string') {
        const categoriesStr: string = updateData.productCategories;
        try {
          updateData.productCategories = JSON.parse(categoriesStr) as string[];
        } catch {
          // If not valid JSON, treat as comma-separated string
          updateData.productCategories = categoriesStr.split(',').map((cat: string) => cat.trim()).filter(Boolean) as string[];
        }
      }
      // If it's already an array, keep it as is
    }

    // Handle serviceAreas if it's a string (convert to array)
    if (updateData.serviceAreas !== undefined) {
      if (typeof updateData.serviceAreas === 'string') {
        const areasStr: string = updateData.serviceAreas;
        try {
          updateData.serviceAreas = JSON.parse(areasStr) as string[];
        } catch {
          // If not valid JSON, treat as comma-separated string
          updateData.serviceAreas = areasStr.split(',').map((area: string) => area.trim()).filter(Boolean) as string[];
        }
      }
      // If it's already an array, keep it as is
    }

    // Remove undefined/null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const seller = await sellerService.updateSeller(userId, updateData as sellerService.SellerUpdateData);
    res.json(seller);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateSellerVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Prepare verification data
    const verificationData: any = { ...req.body };

    // Backward compatibility: Map old field names to new merged field names
    if (verificationData.storeName && !verificationData.companyName) {
      verificationData.companyName = verificationData.storeName;
      delete verificationData.storeName;
    }
    if (verificationData.ownerFullName && !verificationData.fullName) {
      verificationData.fullName = verificationData.ownerFullName;
      delete verificationData.ownerFullName;
    }
    if (verificationData.bankAccountName && !verificationData.bankAccountHolderName) {
      verificationData.bankAccountHolderName = verificationData.bankAccountName;
      delete verificationData.bankAccountName;
    }
    if (verificationData.accountNumber && !verificationData.bankAccountNumber) {
      verificationData.bankAccountNumber = verificationData.accountNumber;
      delete verificationData.accountNumber;
    }
    if (verificationData.ifscCode && !verificationData.bankIfscCode) {
      verificationData.bankIfscCode = verificationData.ifscCode;
      delete verificationData.ifscCode;
    }

    // Handle file uploads if any
    if (req.files) {
      const files = req.files;
      // Map uploaded files to verification fields
      if (files.incorporationCertificate?.[0]) {
        verificationData.incorporationCertificate = (files.incorporationCertificate[0] as any).path || files.incorporationCertificate[0].path;
      }
      if (files.msmeUdyamCertificate?.[0]) {
        verificationData.msmeUdyamCertificate = (files.msmeUdyamCertificate[0] as any).path || files.msmeUdyamCertificate[0].path;
      }
      if (files.businessAddressProof?.[0]) {
        verificationData.businessAddressProof = (files.businessAddressProof[0] as any).path || files.businessAddressProof[0].path;
      }
      if (files.ownerIdDocument?.[0]) {
        verificationData.ownerIdDocument = (files.ownerIdDocument[0] as any).path || files.ownerIdDocument[0].path;
      }
      if (files.iecCertificate?.[0]) {
        verificationData.iecCertificate = (files.iecCertificate[0] as any).path || files.iecCertificate[0].path;
      }
      if (files.apedaCertificate?.[0]) {
        verificationData.apedaCertificate = (files.apedaCertificate[0] as any).path || files.apedaCertificate[0].path;
      }
      if (files.spicesBoardCertificate?.[0]) {
        verificationData.spicesBoardCertificate = (files.spicesBoardCertificate[0] as any).path || files.spicesBoardCertificate[0].path;
      }
      if (files.tradeLicense?.[0]) {
        verificationData.tradeLicense = (files.tradeLicense[0] as any).path || files.tradeLicense[0].path;
      }
      if (files.bankProofDocument?.[0]) {
        verificationData.bankProofDocument = (files.bankProofDocument[0] as any).path || files.bankProofDocument[0].path;
      }
      if (files.fssaiCertificate?.[0]) {
        verificationData.fssaiCertificate = (files.fssaiCertificate[0] as any).path || files.fssaiCertificate[0].path;
      }
      if (files.sampleLabTestCertificate?.[0]) {
        verificationData.sampleLabTestCertificate = (files.sampleLabTestCertificate[0] as any).path || files.sampleLabTestCertificate[0].path;
      }
    }

    // Handle foodQualityCertifications if it's a string (convert to array)
    if (verificationData.foodQualityCertifications !== undefined) {
      if (typeof verificationData.foodQualityCertifications === 'string') {
        const certsStr: string = verificationData.foodQualityCertifications;
        try {
          verificationData.foodQualityCertifications = JSON.parse(certsStr) as string[];
        } catch {
          verificationData.foodQualityCertifications = certsStr.split(',').map((cert: string) => cert.trim()).filter(Boolean) as string[];
        }
      }
    }

    // Handle boolean fields (from FormData they come as strings)
    if (verificationData.labTestingCapability !== undefined) {
      if (typeof verificationData.labTestingCapability === 'string') {
        verificationData.labTestingCapability = verificationData.labTestingCapability === 'true';
      }
      verificationData.labTestingCapability = Boolean(verificationData.labTestingCapability);
    }
    if (verificationData.certificateOfOriginCapability !== undefined) {
      if (typeof verificationData.certificateOfOriginCapability === 'string') {
        verificationData.certificateOfOriginCapability = verificationData.certificateOfOriginCapability === 'true';
      }
      verificationData.certificateOfOriginCapability = Boolean(verificationData.certificateOfOriginCapability);
    }
    if (verificationData.phytosanitaryCertificateCapability !== undefined) {
      if (typeof verificationData.phytosanitaryCertificateCapability === 'string') {
        verificationData.phytosanitaryCertificateCapability = verificationData.phytosanitaryCertificateCapability === 'true';
      }
      verificationData.phytosanitaryCertificateCapability = Boolean(verificationData.phytosanitaryCertificateCapability);
    }
    if (verificationData.packagingCompliance !== undefined) {
      if (typeof verificationData.packagingCompliance === 'string') {
        verificationData.packagingCompliance = verificationData.packagingCompliance === 'true';
      }
      verificationData.packagingCompliance = Boolean(verificationData.packagingCompliance);
    }
    if (verificationData.fumigationCertificateCapability !== undefined) {
      if (typeof verificationData.fumigationCertificateCapability === 'string') {
        verificationData.fumigationCertificateCapability = verificationData.fumigationCertificateCapability === 'true';
      }
      verificationData.fumigationCertificateCapability = Boolean(verificationData.fumigationCertificateCapability);
    }
    if (verificationData.exportLogisticsPrepared !== undefined) {
      if (typeof verificationData.exportLogisticsPrepared === 'string') {
        verificationData.exportLogisticsPrepared = verificationData.exportLogisticsPrepared === 'true';
      }
      verificationData.exportLogisticsPrepared = Boolean(verificationData.exportLogisticsPrepared);
    }

    // Remove undefined/null values
    Object.keys(verificationData).forEach(key => {
      if (verificationData[key as keyof sellerService.SellerVerificationData] === undefined || 
          verificationData[key as keyof sellerService.SellerVerificationData] === null) {
        delete verificationData[key as keyof sellerService.SellerVerificationData];
      }
    });

    const seller = await sellerService.updateSellerVerification(userId, verificationData);
    res.json(seller);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getSellerVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const verification = await sellerService.getSellerVerification(userId);
    res.json(verification);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

