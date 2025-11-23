import { Seller } from "../../models/Seller";
import { Product } from "../../models/Product";
import { Review } from "../../models/Review";
import { Documents } from "../../models/Documents";
import mongoose from "mongoose";

export const getPublicSellerProfile = async (sellerId: string) => {
  try {
    const seller = await Seller.findById(sellerId)
      .select("-password")
      .populate("businessAddressId")
      .populate("documentsId")
      .populate("socialLinksId")
      .lean();

    if (!seller) {
      throw new Error("Seller not found");
    }

    // Get products for this seller
    const products = await Product.find({ sellerId: new mongoose.Types.ObjectId(sellerId) })
      .select("productName category subCategory shortDescription productImages smallPrice smallWeight mediumPrice mediumWeight largePrice largeWeight shippingCost createdAt")
      .populate({
        path: "reviews",
        select: "rating",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get reviews for this seller
    const reviews = await Review.find({ sellerId: new mongoose.Types.ObjectId(sellerId) })
      .select("rating title text date verified buyerId productId")
      .populate({
        path: "buyerId",
        select: "firstName lastName avatar",
      })
      .populate({
        path: "productId",
        select: "id productName productImages",
      })
      .sort({ date: -1 })
      .lean();

    // Calculate average rating from all reviews
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) /
          reviews.length
        : 0;

    // Calculate total products
    const totalProducts = products.length;

    // Calculate total reviews
    const totalReviews = reviews.length;

    return {
      id: seller._id.toString(),
      email: seller.email,
      fullName: seller.fullName,
      companyName: seller.companyName,
      businessLogo: seller.businessLogo,
      about: seller.about,
      storePhotos: seller.storePhotos,
      businessType: seller.businessType,
      productCategories: seller.productCategories,
      mobile: seller.mobile,
      bankName: seller.bankName,
      upiId: seller.upiId,
      businessAddress: seller.businessAddressId,
      socialLinks: seller.socialLinksId,
      profileCompletion: seller.profileCompletion,
      createdAt: seller.createdAt,
      shippingType: seller.documentsId?.shippingType,
      serviceAreas: seller.documentsId?.serviceAreas,
      returnPolicy: seller.documentsId?.returnPolicy,
      gstNumber: seller.documentsId?.gstNumber,
      panNumber: seller.documentsId?.panNumber,
      certificateOfOriginCapability: seller.documentsId?.certificateOfOriginCapability,
      phytosanitaryCertificateCapability: seller.documentsId?.phytosanitaryCertificateCapability,
      packagingCompliance: seller.documentsId?.packagingCompliance,
      fumigationCertificateCapability: seller.documentsId?.fumigationCertificateCapability,
      exportLogisticsPrepared: seller.documentsId?.exportLogisticsPrepared,
      labTestingCapability: seller.documentsId?.labTestingCapability,
      foodQualityCertifications: seller.documentsId?.foodQualityCertifications,
      iecCode: seller.documentsId?.iecCode,
      apedaRegistrationNumber: seller.documentsId?.apedaRegistrationNumber,
      spicesBoardRegistrationNumber: seller.documentsId?.spicesBoardRegistrationNumber,
      fssaiLicenseNumber: seller.documentsId?.fssaiLicenseNumber,
      verificationStatus: seller.documentsId?.verificationStatus || "pending",
      products: products.map((product: any) => ({
        ...product,
        id: product._id.toString(),
        Review: product.reviews || [],
      })),
      Review: reviews.map((review: any) => ({
        ...review,
        id: review._id.toString(),
        buyer: review.buyerId ? {
          firstName: review.buyerId.firstName,
          lastName: review.buyerId.lastName,
          avatar: review.buyerId.avatar,
        } : null,
        product: review.productId ? {
          id: review.productId._id?.toString(),
          productName: review.productId.productName,
          productImages: review.productId.productImages,
        } : null,
      })),
      averageRating: Math.round(averageRating * 10) / 10,
      totalProducts,
      totalReviews,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch seller profile: ${(error as Error).message}`);
  }
};

export const getTopSellers = async (limit: number = 10) => {
  try {
    const sellers = await Seller.find({
      profileCompletion: { $gte: 50 },
    })
      .select("fullName companyName businessLogo about businessAddressId profileCompletion documentCompletion documentsId")
      .populate("businessAddressId")
      .populate({
        path: "documentsId",
        select: "verificationStatus",
      })
      .sort({ profileCompletion: -1, documentCompletion: -1 })
      .limit(limit)
      .lean();

    // Filter sellers with approved verification status
    const approvedSellers = sellers.filter((seller: any) => 
      seller.documentsId?.verificationStatus === "approved"
    );

    // Get product and review counts for each seller
    const sellersWithStats = await Promise.all(
      approvedSellers.map(async (seller: any) => {
        const productCount = await Product.countDocuments({ 
          sellerId: seller._id 
        });
        
        const reviews = await Review.find({ sellerId: seller._id })
          .select("rating")
          .lean();
        
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) /
            reviews.length
          : 0;

        const totalProducts = productCount;
      const totalReviews = reviews.length;

        const location = seller.businessAddressId
          ? `${seller.businessAddressId.city || ""}, ${seller.businessAddressId.country || ""}`
            .trim()
            .replace(/^,\s*/, "")
            .replace(/,\s*$/, "")
        : "Unknown Location";

      return {
          id: seller._id.toString(),
        name: seller.companyName || seller.fullName || "Unknown Seller",
        logo: seller.businessLogo,
        about: seller.about,
        location,
        averageRating: Math.round(averageRating * 10) / 10,
        totalProducts,
        totalReviews,
      };
      })
    );

    return sellersWithStats;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch top sellers: ${(error as Error).message}`);
  }
};
