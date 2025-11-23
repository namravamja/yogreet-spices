import { Seller } from "../../models/Seller";
import { Buyer } from "../../models/Buyer";
import { Product } from "../../models/Product";
import { Order } from "../../models/Order";
import { Admin } from "../../models/Admin";
import { Documents } from "../../models/Documents";

export const getAllSellers = async () => {
  try {
    const sellers = await Seller.find()
      .select("email fullName companyName mobile businessType businessLogo profileCompletion documentCompletion isVerified isAuthenticated createdAt updatedAt businessAddressId documentsId")
      .populate({
        path: "businessAddressId",
        select: "city state country",
      })
      .populate({
        path: "documentsId",
        select: "verificationStatus changedFields",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get product and order counts for each seller
    const sellersWithCounts = await Promise.all(
      sellers.map(async (seller: any) => {
        const productCount = await Product.countDocuments({ sellerId: seller._id });
        const orderItemCount = await Order.countDocuments({ 
          "orderItems.sellerId": seller._id 
        });

        return {
          id: seller._id.toString(),
          email: seller.email,
          fullName: seller.fullName,
          companyName: seller.companyName,
          mobile: seller.mobile,
          businessType: seller.businessType,
          businessLogo: seller.businessLogo,
          profileCompletion: seller.profileCompletion,
          documentCompletion: seller.documentCompletion,
          verificationStatus: seller.documentsId?.verificationStatus || "pending",
          changedFields: seller.documentsId?.changedFields || [],
          isVerified: seller.isVerified,
          isAuthenticated: seller.isAuthenticated,
          createdAt: seller.createdAt,
          updatedAt: seller.updatedAt,
          businessAddress: seller.businessAddressId,
          _count: {
            products: productCount,
            orderItems: orderItemCount,
          },
        };
      })
    );

    return sellersWithCounts;
  } catch (error) {
    throw new Error(`Failed to fetch sellers: ${(error as Error).message}`);
  }
};

export const getAllBuyers = async () => {
  try {
    const buyers = await Buyer.find()
      .select("email firstName lastName phone avatar isVerified isAuthenticated createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    const { Address } = await import("../../models/Address");
    const { Order } = await import("../../models/Order");
    const { Cart } = await import("../../models/Cart");

    // Get addresses, order and cart counts for each buyer
    const buyersWithCounts = await Promise.all(
      buyers.map(async (buyer: any) => {
        const addresses = await Address.find({ userId: buyer._id })
          .select("city state country")
          .limit(1)
          .lean();
        
        const orderCount = await Order.countDocuments({ buyerId: buyer._id });
        const cartCount = await Cart.countDocuments({ buyerId: buyer._id });

        return {
          id: buyer._id.toString(),
          email: buyer.email,
          firstName: buyer.firstName,
          lastName: buyer.lastName,
          phone: buyer.phone,
          avatar: buyer.avatar,
          isVerified: buyer.isVerified,
          isAuthenticated: buyer.isAuthenticated,
          createdAt: buyer.createdAt,
          updatedAt: buyer.updatedAt,
          addresses: addresses,
          _count: {
            orders: orderCount,
            cartItems: cartCount,
          },
        };
      })
    );

    return buyersWithCounts;
  } catch (error) {
    throw new Error(`Failed to fetch buyers: ${(error as Error).message}`);
  }
};

export const getAdminStats = async () => {
  try {
    const [totalSellers, totalBuyers, totalProducts, totalOrders] = await Promise.all([
      Seller.countDocuments(),
      Buyer.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    const verifiedSellers = await Documents.countDocuments({
      verificationStatus: "approved",
    });

    const activeSellers = await Seller.countDocuments({
      isVerified: true,
    });

    return {
      totalSellers,
      totalBuyers,
      totalProducts,
      totalOrders,
      verifiedSellers,
      activeSellers,
    };
  } catch (error) {
    throw new Error(`Failed to fetch admin stats: ${(error as Error).message}`);
  }
};

export const getAdminById = async (id: string) => {
  try {
    const admin = await Admin.findById(id).select("-password").lean();
    if (!admin) {
      throw new Error("Admin not found");
    }
    return admin;
  } catch (error) {
    throw new Error(`Failed to fetch admin: ${(error as Error).message}`);
  }
};

export const getSellerById = async (sellerId: string) => {
  try {
    const seller = await Seller.findById(sellerId)
      .select("-password -forgotPasswordToken -forgotPasswordExpires -verifyToken -verifyExpires")
      .populate({
        path: "businessAddressId",
        select: "street city state country pinCode",
      })
      .populate({
        path: "documentsId",
      })
      .populate({
        path: "socialLinksId",
        select: "website instagram facebook twitter",
      })
      .lean();

    if (!seller) {
      throw new Error("Seller not found");
    }

    // Get product and order counts
    const productCount = await Product.countDocuments({ sellerId: seller._id });
    const orderCount = await Order.countDocuments({ 
      "orderItems.sellerId": seller._id 
    });

    const documents = seller.documentsId as any;
    const sellerData: any = {
      ...seller,
      id: seller._id.toString(),
      _count: {
        products: productCount,
        orders: orderCount,
      },
    };

    // Flatten document fields to root level for backward compatibility
    if (documents) {
      // Step 1: Business Identity Verification
      if (documents.panNumber) sellerData.panNumber = documents.panNumber;
      if (documents.gstNumber) sellerData.gstNumber = documents.gstNumber;
      if (documents.ownerIdDocument) sellerData.ownerIdDocument = documents.ownerIdDocument;
      if (documents.incorporationCertificate) sellerData.incorporationCertificate = documents.incorporationCertificate;
      if (documents.msmeUdyamCertificate) sellerData.msmeUdyamCertificate = documents.msmeUdyamCertificate;
      if (documents.businessAddressProof) sellerData.businessAddressProof = documents.businessAddressProof;
      if (documents.aadharNumber) sellerData.aadharNumber = documents.aadharNumber;

      // Step 2: Export Eligibility Verification
      if (documents.iecCode) sellerData.iecCode = documents.iecCode;
      if (documents.iecCertificate) sellerData.iecCertificate = documents.iecCertificate;
      if (documents.apedaRegistrationNumber) sellerData.apedaRegistrationNumber = documents.apedaRegistrationNumber;
      if (documents.apedaCertificate) sellerData.apedaCertificate = documents.apedaCertificate;
      if (documents.spicesBoardRegistrationNumber) sellerData.spicesBoardRegistrationNumber = documents.spicesBoardRegistrationNumber;
      if (documents.spicesBoardCertificate) sellerData.spicesBoardCertificate = documents.spicesBoardCertificate;
      if (documents.tradeLicense) sellerData.tradeLicense = documents.tradeLicense;
      if (documents.bankAccountHolderName) sellerData.bankAccountHolderName = documents.bankAccountHolderName;
      if (documents.bankAccountNumber) sellerData.bankAccountNumber = documents.bankAccountNumber;
      if (documents.bankIfscCode) sellerData.bankIfscCode = documents.bankIfscCode;
      if (documents.bankProofDocument) sellerData.bankProofDocument = documents.bankProofDocument;

      // Step 3: Food & Safety Compliance
      if (documents.fssaiLicenseNumber) sellerData.fssaiLicenseNumber = documents.fssaiLicenseNumber;
      if (documents.fssaiCertificate) sellerData.fssaiCertificate = documents.fssaiCertificate;
      if (documents.foodQualityCertifications) sellerData.foodQualityCertifications = documents.foodQualityCertifications;
      if (documents.labTestingCapability !== undefined) sellerData.labTestingCapability = documents.labTestingCapability;

      // Step 4: Shipping & Logistics
      if (documents.shippingType) sellerData.shippingType = documents.shippingType;
      if (documents.serviceAreas) sellerData.serviceAreas = documents.serviceAreas;
      if (documents.returnPolicy) sellerData.returnPolicy = documents.returnPolicy;

      // Step 5: Export Documentation & Shipment Capability
      if (documents.certificateOfOriginCapability !== undefined) sellerData.certificateOfOriginCapability = documents.certificateOfOriginCapability;
      if (documents.phytosanitaryCertificateCapability !== undefined) sellerData.phytosanitaryCertificateCapability = documents.phytosanitaryCertificateCapability;
      if (documents.packagingCompliance !== undefined) sellerData.packagingCompliance = documents.packagingCompliance;
      if (documents.fumigationCertificateCapability !== undefined) sellerData.fumigationCertificateCapability = documents.fumigationCertificateCapability;
      if (documents.exportLogisticsPrepared !== undefined) sellerData.exportLogisticsPrepared = documents.exportLogisticsPrepared;

      // Verification Status
      if (documents.verificationStatus) sellerData.verificationStatus = documents.verificationStatus;
      if (documents.verificationSubmittedAt) sellerData.verificationSubmittedAt = documents.verificationSubmittedAt;
      if (documents.verificationReviewedAt) sellerData.verificationReviewedAt = documents.verificationReviewedAt;
      if (documents.verificationNotes) sellerData.verificationNotes = documents.verificationNotes;
      if (documents.verifiedDocuments) sellerData.verifiedDocuments = documents.verifiedDocuments;
      if (documents.changedFields) sellerData.changedFields = documents.changedFields;
    }

    // Also include documents object for reference
    sellerData.documents = documents;

    return sellerData;
  } catch (error) {
    throw new Error(`Failed to fetch seller: ${(error as Error).message}`);
  }
};

export const verifySellerDocument = async (sellerId: string, documentField: string) => {
  try {
    const seller = await Seller.findById(sellerId).select("documentsId").lean();
    if (!seller) {
      throw new Error("Seller not found");
    }

    if (!seller.documentsId) {
      throw new Error("Documents record not found for seller");
    }

    const documents = await Documents.findById(seller.documentsId);
    if (!documents) {
      throw new Error("Documents record not found");
    }

    // Initialize verifiedDocuments array if it doesn't exist
    if (!documents.verifiedDocuments) {
      documents.verifiedDocuments = [];
    }

    // Add document to verified list if not already present
    if (!documents.verifiedDocuments.includes(documentField)) {
      documents.verifiedDocuments.push(documentField);
    }

    // Remove from changedFields if present (field has been reviewed)
    if (documents.changedFields && documents.changedFields.includes(documentField)) {
      documents.changedFields = documents.changedFields.filter(
        (field: string) => field !== documentField
      );
    }

    // Also handle nested field paths (e.g., "businessAddress.street" should remove "businessAddress.street" and potentially "businessAddress" if all sub-fields are verified)
    if (documents.changedFields) {
      documents.changedFields = documents.changedFields.filter(
        (field: string) => field !== documentField && !field.startsWith(documentField + ".")
      );
    }

    await documents.save();

    return documents.verifiedDocuments;
  } catch (error) {
    throw new Error(`Failed to verify document: ${(error as Error).message}`);
  }
};

export const unverifySellerDocument = async (sellerId: string, documentField: string) => {
  try {
    const seller = await Seller.findById(sellerId).select("documentsId").lean();
    if (!seller) {
      throw new Error("Seller not found");
    }

    if (!seller.documentsId) {
      throw new Error("Documents record not found for seller");
    }

    const documents = await Documents.findById(seller.documentsId);
    if (!documents) {
      throw new Error("Documents record not found");
    }

    // Remove document from verified list
    if (documents.verifiedDocuments && documents.verifiedDocuments.includes(documentField)) {
      documents.verifiedDocuments = documents.verifiedDocuments.filter(
        (doc) => doc !== documentField
      );
      
      // Add back to changedFields since it's been unverified
      if (!documents.changedFields) {
        documents.changedFields = [];
      }
      if (!documents.changedFields.includes(documentField)) {
        documents.changedFields.push(documentField);
      }
      
      await documents.save();
    }

    return documents.verifiedDocuments;
  } catch (error) {
    throw new Error(`Failed to unverify document: ${(error as Error).message}`);
  }
};

export const updateSellerVerificationStatus = async (sellerId: string, status: "approved" | "rejected", notes?: string) => {
  try {
    const seller = await Seller.findById(sellerId).select("documentsId").lean();
    if (!seller) {
      throw new Error("Seller not found");
    }

    if (!seller.documentsId) {
      throw new Error("Documents record not found for seller");
    }

    const documents = await Documents.findById(seller.documentsId);
    if (!documents) {
      throw new Error("Documents record not found");
    }

    // Update verification status
    documents.verificationStatus = status;
    documents.verificationReviewedAt = new Date();
    
    if (notes) {
      documents.verificationNotes = notes;
    }

    // If approved, also update seller's isVerified flag
    if (status === "approved") {
      await Seller.findByIdAndUpdate(sellerId, { 
        $set: { isVerified: true } 
      });
    } else if (status === "rejected") {
      await Seller.findByIdAndUpdate(sellerId, { 
        $set: { isVerified: false } 
      });
    }

    await documents.save();

    return {
      verificationStatus: documents.verificationStatus,
      verificationReviewedAt: documents.verificationReviewedAt,
      verificationNotes: documents.verificationNotes,
    };
  } catch (error) {
    throw new Error(`Failed to update verification status: ${(error as Error).message}`);
  }
};

export const markFieldsAsReviewed = async (sellerId: string, fields: string[]) => {
  try {
    const seller = await Seller.findById(sellerId).select("documentsId").lean();
    if (!seller) {
      throw new Error("Seller not found");
    }

    if (!seller.documentsId) {
      throw new Error("Documents record not found for seller");
    }

    const documents = await Documents.findById(seller.documentsId);
    if (!documents) {
      throw new Error("Documents record not found");
    }

    if (!documents.changedFields) {
      documents.changedFields = [];
    }

    // Remove the specified fields from changedFields
    // Also remove any nested fields (e.g., if "businessAddress" is in fields, remove "businessAddress.street", etc.)
    documents.changedFields = documents.changedFields.filter((field: string) => {
      // Check if this field should be removed
      const shouldRemove = fields.some(f => {
        // Exact match
        if (field === f) return true;
        // Nested field match (e.g., "businessAddress.street" when f is "businessAddress")
        if (field.startsWith(f + ".")) return true;
        return false;
      });
      return !shouldRemove;
    });

    await documents.save();

    return {
      changedFields: documents.changedFields,
    };
  } catch (error) {
    throw new Error(`Failed to mark fields as reviewed: ${(error as Error).message}`);
  }
};
