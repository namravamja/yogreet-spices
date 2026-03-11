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

export const getBuyerById = async (buyerId: string) => {
  try {
    const buyer = await Buyer.findById(buyerId)
      .select("-password -forgotPasswordToken -forgotPasswordExpires -verifyToken -verifyExpires")
      .lean();

    if (!buyer) {
      throw new Error("Buyer not found");
    }

    const { Address } = await import("../../models/Address");
    const { Cart } = await import("../../models/Cart");

    // Get addresses
    const addresses = await Address.find({ userId: buyer._id }).lean();

    // Get order and cart counts
    const orderCount = await Order.countDocuments({ buyerId: buyer._id });
    const cartCount = await Cart.countDocuments({ buyerId: buyer._id });

    return {
      id: buyer._id.toString(),
      email: (buyer as any).email,
      firstName: (buyer as any).firstName,
      lastName: (buyer as any).lastName,
      phone: (buyer as any).phone,
      avatar: (buyer as any).avatar,
      dateOfBirth: (buyer as any).dateOfBirth,
      gender: (buyer as any).gender,
      companyName: (buyer as any).companyName,
      companyRegistrationNumber: (buyer as any).companyRegistrationNumber,
      isVerified: (buyer as any).isVerified,
      isAuthenticated: (buyer as any).isAuthenticated,
      createdAt: (buyer as any).createdAt,
      updatedAt: (buyer as any).updatedAt,
      addresses: addresses.map((addr: any) => ({
        id: addr._id.toString(),
        street: addr.street,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        pinCode: addr.pinCode,
        isDefault: addr.isDefault,
      })),
      _count: {
        orders: orderCount,
        cartItems: cartCount,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch buyer: ${(error as Error).message}`);
  }
};

export const getSellerProductsById = async (sellerId: string) => {
  try {
    // Verify seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new Error("Seller not found");
    }

    const { Review } = await import("../../models/Review");
    const { Discount } = await import("../../models/Discount");
    const mongoose = await import("mongoose");

    const products = await Product.find({ sellerId: new mongoose.default.Types.ObjectId(sellerId) })
      .populate({
        path: "reviews",
        select: "rating title text date verified buyerId",
        populate: {
          path: "buyerId",
          select: "firstName lastName",
        },
      })
      .populate({
        path: "activeDiscount",
        select: "name code type value isActive startDate endDate",
      })
      .sort({ createdAt: -1 })
      .lean();

    return products.map((product: any) => {
      // Check if discount is valid
      let activeDiscount = null;
      if (product.activeDiscount && product.activeDiscount.isActive) {
        const now = new Date();
        const startDate = product.activeDiscount.startDate ? new Date(product.activeDiscount.startDate) : null;
        const endDate = product.activeDiscount.endDate ? new Date(product.activeDiscount.endDate) : null;
        
        const isValidDate = (!startDate || now >= startDate) && (!endDate || now <= endDate);
        
        if (isValidDate) {
          activeDiscount = {
            id: product.activeDiscount._id?.toString(),
            name: product.activeDiscount.name,
            code: product.activeDiscount.code,
            type: product.activeDiscount.type,
            value: product.activeDiscount.value,
          };
        }
      }

      return {
        id: product._id.toString(),
        productName: product.productName,
        category: product.category,
        subCategory: product.subCategory,
        typeOfSpice: product.typeOfSpice,
        form: product.form,
        shortDescription: product.shortDescription,
        productImages: product.productImages,
        shippingCost: product.shippingCost,
        purityLevel: product.purityLevel,
        originSource: product.originSource,
        processingMethod: product.processingMethod,
        shelfLife: product.shelfLife,
        manufacturingDate: product.manufacturingDate,
        expiryDate: product.expiryDate,
        samplePrice: product.samplePrice,
        sampleWeight: product.sampleWeight,
        sampleDescription: product.sampleDescription,
        smallPrice: product.smallPrice,
        smallWeight: product.smallWeight,
        smallDescription: product.smallDescription,
        mediumPrice: product.mediumPrice,
        mediumWeight: product.mediumWeight,
        mediumDescription: product.mediumDescription,
        largePrice: product.largePrice,
        largeWeight: product.largeWeight,
        largeDescription: product.largeDescription,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        Review: product.reviews?.map((review: any) => ({
          id: review._id.toString(),
          rating: review.rating,
          title: review.title,
          text: review.text,
          date: review.date,
          verified: review.verified,
          buyer: review.buyerId ? {
            firstName: review.buyerId.firstName,
            lastName: review.buyerId.lastName,
          } : null,
        })) || [],
        activeDiscount,
      };
    });
  } catch (error) {
    throw new Error(`Failed to fetch seller products: ${(error as Error).message}`);
  }
};

export const getBuyerOrdersById = async (buyerId: string) => {
  try {
    // Verify buyer exists
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      throw new Error("Buyer not found");
    }

    const { OrderItem } = await import("../../models/OrderItem");
    const { Address } = await import("../../models/Address");
    const mongoose = await import("mongoose");

    const orders = await Order.find({ buyerId: new mongoose.default.Types.ObjectId(buyerId) })
      .populate({
        path: "shippingAddressId",
      })
      .sort({ placedAt: -1 })
      .lean();

    // Get order items for each order with product and seller info
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const orderItems = await OrderItem.find({
          orderId: order._id,
        })
          .populate({
            path: "productId",
            select: "productName productImages category",
          })
          .populate({
            path: "sellerId",
            select: "fullName companyName email",
          })
          .lean();

        return {
          id: order._id.toString(),
          buyerId: order.buyerId?.toString(),
          totalAmount: order.totalAmount,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          taxAmount: order.taxAmount,
          status: order.status,
          deliveryStatus: order.deliveryStatus,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          gateway: order.gateway,
          currency: order.currency,
          placedAt: order.placedAt,
          deliveredAt: order.deliveredAt,
          autoReleaseAt: order.autoReleaseAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          shippingAddress: order.shippingAddressId ? {
            id: order.shippingAddressId._id?.toString(),
            street: order.shippingAddressId.street,
            city: order.shippingAddressId.city,
            state: order.shippingAddressId.state,
            country: order.shippingAddressId.country,
            pinCode: order.shippingAddressId.pinCode,
          } : null,
          orderItems: orderItems.map((item: any) => ({
            id: item._id.toString(),
            productId: item.productId?._id?.toString() || item.productId?.toString(),
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            product: item.productId ? {
              id: item.productId._id.toString(),
              productName: item.productId.productName,
              productImages: item.productId.productImages || [],
              category: item.productId.category,
            } : null,
            seller: item.sellerId ? {
              id: item.sellerId._id.toString(),
              fullName: item.sellerId.fullName,
              companyName: item.sellerId.companyName || item.sellerId.fullName,
              email: item.sellerId.email,
            } : null,
          })),
        };
      })
    );

    return ordersWithItems;
  } catch (error) {
    throw new Error(`Failed to fetch buyer orders: ${(error as Error).message}`);
  }
};

export const getSellerOrdersById = async (sellerId: string) => {
  try {
    // Verify seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new Error("Seller not found");
    }

    const { OrderItem } = await import("../../models/OrderItem");
    const mongoose = await import("mongoose");

    // Find all order items for this seller
    const sellerItems = await OrderItem.find({ sellerId: new mongoose.default.Types.ObjectId(sellerId) }, { orderId: 1 }).lean();
    const orderIds = Array.from(new Set(sellerItems.map((item: any) => item.orderId.toString())));

    if (orderIds.length === 0) {
      return [];
    }

    const orders = await Order.find({ _id: { $in: orderIds.map((id) => new mongoose.default.Types.ObjectId(id)) } })
      .populate({
        path: "buyerId",
        select: "firstName lastName email phone",
      })
      .populate({
        path: "shippingAddressId",
      })
      .sort({ placedAt: -1 })
      .lean();

    // Get order items for each order (only items belonging to this seller)
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const orderItems = await OrderItem.find({
          orderId: order._id,
          sellerId: new mongoose.default.Types.ObjectId(sellerId),
        })
          .populate({
            path: "productId",
            select: "productName productImages category",
          })
          .lean();

        return {
          id: order._id.toString(),
          buyer: order.buyerId ? {
            id: order.buyerId._id.toString(),
            firstName: order.buyerId.firstName,
            lastName: order.buyerId.lastName,
            email: order.buyerId.email,
            phone: order.buyerId.phone,
          } : null,
          totalAmount: order.totalAmount,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          taxAmount: order.taxAmount,
          status: order.status,
          deliveryStatus: order.deliveryStatus,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          gateway: order.gateway,
          currency: order.currency,
          placedAt: order.placedAt,
          deliveredAt: order.deliveredAt,
          autoReleaseAt: order.autoReleaseAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          shippingAddress: order.shippingAddressId ? {
            id: order.shippingAddressId._id?.toString(),
            street: order.shippingAddressId.street,
            city: order.shippingAddressId.city,
            state: order.shippingAddressId.state,
            country: order.shippingAddressId.country,
            pinCode: order.shippingAddressId.pinCode,
          } : null,
          orderItems: orderItems.map((item: any) => ({
            id: item._id.toString(),
            productId: item.productId?._id?.toString() || item.productId?.toString(),
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            product: item.productId ? {
              id: item.productId._id.toString(),
              productName: item.productId.productName,
              productImages: item.productId.productImages || [],
              category: item.productId.category,
            } : null,
          })),
        };
      })
    );

    return ordersWithItems;
  } catch (error) {
    throw new Error(`Failed to fetch seller orders: ${(error as Error).message}`);
  }
};
