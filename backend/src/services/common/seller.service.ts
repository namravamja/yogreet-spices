import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPublicSellerProfile = async (sellerId: string) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        fullName: true,
        companyName: true,
        businessLogo: true,
        about: true,
        storePhotos: true,
        businessType: true,
        productCategories: true,
        mobile: true,
        shippingType: true,
        serviceAreas: true,
        returnPolicy: true,
        gstNumber: true,
        panNumber: true,
        bankName: true,
        upiId: true,
        businessAddress: {
          select: {
            street: true,
            city: true,
            state: true,
            country: true,
            pinCode: true,
          },
        },
        socialLinks: {
          select: {
            website: true,
            facebook: true,
            instagram: true,
            twitter: true,
          },
        },
        verificationStatus: true,
        profileCompletion: true,
        // Export capabilities (public info)
        certificateOfOriginCapability: true,
        phytosanitaryCertificateCapability: true,
        packagingCompliance: true,
        fumigationCertificateCapability: true,
        exportLogisticsPrepared: true,
        labTestingCapability: true,
        foodQualityCertifications: true,
        // Verification numbers (public info)
        iecCode: true,
        apedaRegistrationNumber: true,
        spicesBoardRegistrationNumber: true,
        fssaiLicenseNumber: true,
        products: {
          where: {
            // Only show active products
          },
          select: {
            id: true,
            productName: true,
            category: true,
            subCategory: true,
            shortDescription: true,
            productImages: true,
            smallPrice: true,
            smallWeight: true,
            mediumPrice: true,
            mediumWeight: true,
            largePrice: true,
            largeWeight: true,
            shippingCost: true,
            createdAt: true,
            Review: {
              select: {
                rating: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
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
                avatar: true,
              },
            },
            product: {
              select: {
                id: true,
                productName: true,
                productImages: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!seller) {
      throw new Error("Seller not found");
    }

    // Calculate average rating from all reviews
    const reviews = seller.Review || [];
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) /
          reviews.length
        : 0;

    // Calculate total products
    const products = seller.products || [];
    const totalProducts = products.length;

    // Calculate total reviews
    const totalReviews = reviews.length;

    return {
      ...seller,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
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

