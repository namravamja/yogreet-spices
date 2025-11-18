"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  Star,
  Package,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  CheckCircle2,
  Truck,
  Calendar,
  Award,
  Users,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Shield,
  Box,
  Globe2,
  Building2,
} from "lucide-react";
import { useGetPublicSellerProfileQuery } from "@/services/api/publicApi";

// Safe data access utilities
const safeString = (value: any): string => {
  return value ? String(value) : "";
};

const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("all");

  const {
    data: seller,
    isLoading,
    error,
  } = useGetPublicSellerProfileQuery(sellerId, {
    skip: !sellerId,
  });

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (!seller?.products) return [];
    if (selectedProductCategory === "all") return seller.products;
    return seller.products.filter(
      (product: any) => product.category === selectedProductCategory
    );
  }, [seller?.products, selectedProductCategory]);

  // Get unique categories from products
  const productCategories = useMemo(() => {
    if (!seller?.products) return [];
    const categories = new Set(seller.products.map((p: any) => p.category));
    return Array.from(categories) as string[];
  }, [seller?.products]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
            <p className="text-stone-600 font-inter">Loading seller profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !seller) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center py-16">
          <Store className="w-24 h-24 mx-auto text-red-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4 font-poppins">
            Seller Not Found
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            {error && typeof error === "object" && "data" in error
              ? String((error as any).data?.error || "Seller not found")
              : "The seller you're looking for doesn't exist."}
          </p>
          <Link
            href="/explore"
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer inline-block"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* Header Section */}
      <div className="bg-white border border-stone-200 p-6 sm:p-8 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Seller Logo/Image */}
          <div className="shrink-0">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-stone-100 border border-stone-200 overflow-hidden">
              {seller.businessLogo ? (
                <Image
                  src={seller.businessLogo}
                  alt={safeString(seller.companyName || seller.fullName || "Seller")}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.jpg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-200">
                  <Store className="w-16 h-16 text-stone-400" />
                </div>
              )}
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-light text-stone-900 font-poppins">
                    {safeString(seller.companyName || seller.fullName || "Seller")}
                  </h1>
                  {seller.verificationStatus === "approved" && (
                    <div title="Verified Seller">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  )}
                </div>
                {seller.businessType && (
                  <p className="text-stone-600 font-inter mb-2">
                    {safeString(seller.businessType)}
                  </p>
                )}
                {seller.businessAddress && (
                  <div className="flex items-center gap-2 text-stone-600 font-inter mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[
                        seller.businessAddress.city,
                        seller.businessAddress.state,
                        seller.businessAddress.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Rating & Stats */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(seller.averageRating || 0)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-stone-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-stone-900 font-manrope">
                    {seller.averageRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <p className="text-sm text-stone-600 font-inter">
                  {seller.totalReviews || 0} {seller.totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center gap-2 text-stone-700 font-inter">
                <Package className="w-5 h-5 text-stone-500" />
                <span className="font-medium">{seller.totalProducts || 0}</span>
                <span className="text-stone-600">Products</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 font-inter">
                <Users className="w-5 h-5 text-stone-500" />
                <span className="font-medium">{seller.totalReviews || 0}</span>
                <span className="text-stone-600">Reviews</span>
              </div>
              {seller.profileCompletion && (
                <div className="flex items-center gap-2 text-stone-700 font-inter">
                  <Award className="w-5 h-5 text-stone-500" />
                  <span className="font-medium">{seller.profileCompletion}%</span>
                  <span className="text-stone-600">Profile Complete</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {seller.socialLinks && (
              <div className="flex items-center gap-4">
                {seller.socialLinks.website && (
                  <a
                    href={seller.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 hover:text-yogreet-sage transition-colors"
                    aria-label="Website"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {seller.socialLinks.facebook && (
                  <a
                    href={seller.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 hover:text-blue-600 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {seller.socialLinks.instagram && (
                  <a
                    href={seller.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 hover:text-pink-600 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {seller.socialLinks.twitter && (
                  <a
                    href={seller.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 hover:text-blue-400 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          {seller.about && (
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <h2 className="text-xl font-medium text-stone-900 mb-4 font-poppins">
                About
              </h2>
              <p className="text-stone-700 font-inter leading-relaxed whitespace-pre-line">
                {safeString(seller.about)}
              </p>
            </div>
          )}

          {/* Store Photos */}
          {seller.storePhotos && seller.storePhotos.length > 0 && (
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <h2 className="text-xl font-medium text-stone-900 mb-4 font-poppins">
                Store Photos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {seller.storePhotos.map((photo: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-stone-100 border border-stone-200 overflow-hidden"
                  >
                    <Image
                      src={photo}
                      alt={`Store photo ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-medium text-stone-900 font-poppins">
                Products ({filteredProducts.length})
              </h2>
              {productCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedProductCategory("all")}
                    className={`px-4 py-2 border transition-colors font-inter text-sm cursor-pointer ${
                      selectedProductCategory === "all"
                        ? "bg-yogreet-sage text-white border-yogreet-sage"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    All
                  </button>
                  {productCategories.map((category: string) => (
                    <button
                      key={category}
                      onClick={() => setSelectedProductCategory(category)}
                      className={`px-4 py-2 border transition-colors font-inter text-sm cursor-pointer ${
                        selectedProductCategory === category
                          ? "bg-yogreet-sage text-white border-yogreet-sage"
                          : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((product: any) => {
                  const productImage = product.productImages?.[0] || "/placeholder.jpg";
                  const productRating =
                    product.Review && product.Review.length > 0
                      ? product.Review.reduce(
                          (sum: number, r: any) => sum + (r.rating || 0),
                          0
                        ) / product.Review.length
                      : 0;

                  return (
                    <Link
                      key={product.id}
                      href={`/explore/${product.id}`}
                      className="border border-stone-200 hover:border-yogreet-sage transition-colors overflow-hidden group"
                    >
                      <div className="relative aspect-square bg-stone-100 overflow-hidden">
                        <Image
                          src={productImage}
                          alt={safeString(product.productName)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-stone-900 mb-1 font-manrope line-clamp-1">
                          {safeString(product.productName)}
                        </h3>
                        <p className="text-sm text-stone-600 mb-2 font-inter line-clamp-2">
                          {safeString(product.shortDescription)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm text-stone-700 font-inter">
                              {productRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-right">
                            {product.smallPrice && (
                              <p className="text-sm font-medium text-yogreet-sage font-poppins">
                                ₹{safeNumber(product.smallPrice).toFixed(2)}
                              </p>
                            )}
                            {product.mediumPrice && !product.smallPrice && (
                              <p className="text-sm font-medium text-yogreet-sage font-poppins">
                                ₹{safeNumber(product.mediumPrice).toFixed(2)}
                              </p>
                            )}
                            {product.largePrice && !product.smallPrice && !product.mediumPrice && (
                              <p className="text-sm font-medium text-yogreet-sage font-poppins">
                                ₹{safeNumber(product.largePrice).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-600 font-inter">
                  {selectedProductCategory === "all"
                    ? "No products available"
                    : "No products in this category"}
                </p>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          {seller.Review && seller.Review.length > 0 && (
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <h2 className="text-xl font-medium text-stone-900 mb-6 font-poppins flex items-center gap-2">
                <Star className="w-5 h-5" />
                Customer Reviews ({seller.Review.length})
              </h2>
              <div className="space-y-6">
                {seller.Review.map((review: any) => (
                  <div
                    key={review.id}
                    className="border-b border-stone-100 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {review.buyer?.avatar ? (
                          <div className="relative w-10 h-10 bg-stone-200 overflow-hidden">
                            <Image
                              src={review.buyer.avatar}
                              alt={`${review.buyer.firstName} ${review.buyer.lastName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-stone-200 flex items-center justify-center">
                            <Users className="w-6 h-6 text-stone-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-900 font-manrope">
                            {safeString(review.buyer?.firstName || "Anonymous")}{" "}
                            {safeString(review.buyer?.lastName || "")}
                          </p>
                          {review.product && (
                            <Link
                              href={`/explore/${review.product.id}`}
                              className="text-sm text-stone-600 hover:text-yogreet-sage font-inter"
                            >
                              {safeString(review.product.productName)}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || 0)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-stone-300"
                              }`}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 font-inter">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-medium text-stone-900 mb-2 font-manrope">
                        {safeString(review.title)}
                      </h4>
                    )}
                    {review.text && (
                      <p className="text-stone-600 font-inter mb-2">
                        {safeString(review.text)}
                      </p>
                    )}
                    <p className="text-sm text-stone-500 font-inter">
                      {review.date
                        ? new Date(review.date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </h3>
            <div className="space-y-3">
              {seller.mobile && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-stone-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-stone-600 font-inter">Phone</p>
                    <a
                      href={`tel:${seller.mobile}`}
                      className="text-stone-700 hover:text-yogreet-sage font-inter"
                    >
                      {safeString(seller.mobile)}
                    </a>
                  </div>
                </div>
              )}
              {seller.businessAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-stone-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                      Address
                    </p>
                    <p className="text-stone-700 font-inter">
                      {[
                        seller.businessAddress.street,
                        seller.businessAddress.city,
                        seller.businessAddress.state,
                        seller.businessAddress.pinCode,
                        seller.businessAddress.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </h3>
            <div className="space-y-3">
              {seller.businessType && (
                <div>
                  <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                    Business Type
                  </p>
                  <p className="text-stone-700 font-inter">{safeString(seller.businessType)}</p>
                </div>
              )}
              {seller.productCategories && seller.productCategories.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                    Product Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seller.productCategories.map((category: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-stone-100 text-stone-700 text-sm font-inter"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {seller.serviceAreas && seller.serviceAreas.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                    Service Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seller.serviceAreas.map((area: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-stone-100 text-stone-700 text-sm font-inter"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping & Payment
            </h3>
            <div className="space-y-3">
              {seller.shippingType && (
                <div>
                  <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                    Shipping Type
                  </p>
                  <p className="text-stone-700 font-inter">{safeString(seller.shippingType)}</p>
                </div>
              )}
              {seller.bankName && (
                <div>
                  <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                    Bank Name
                  </p>
                  <p className="text-stone-700 font-inter">{safeString(seller.bankName)}</p>
                </div>
              )}
              {seller.upiId && (
                <div>
                  <p className="text-sm font-medium text-stone-600 font-inter mb-1">UPI ID</p>
                  <p className="text-stone-700 font-inter">{safeString(seller.upiId)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Registration */}
          {(seller.gstNumber || seller.panNumber || seller.iecCode || seller.apedaRegistrationNumber || seller.spicesBoardRegistrationNumber || seller.fssaiLicenseNumber) && (
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Business Registration
              </h3>
              <div className="space-y-3">
                {seller.gstNumber && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                      GST Number
                    </p>
                    <p className="text-stone-700 font-inter">{safeString(seller.gstNumber)}</p>
                  </div>
                )}
                {seller.panNumber && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                      PAN Number
                    </p>
                    <p className="text-stone-700 font-inter">{safeString(seller.panNumber)}</p>
                  </div>
                )}
                {seller.iecCode && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                      IEC Code
                    </p>
                    <p className="text-stone-700 font-inter">{safeString(seller.iecCode)}</p>
                  </div>
                )}
                {seller.apedaRegistrationNumber && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                      APEDA Registration
                    </p>
                    <p className="text-stone-700 font-inter">
                      {safeString(seller.apedaRegistrationNumber)}
                    </p>
                  </div>
                )}
                {seller.spicesBoardRegistrationNumber && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                      Spices Board Registration
                    </p>
                    <p className="text-stone-700 font-inter">
                      {safeString(seller.spicesBoardRegistrationNumber)}
                    </p>
                  </div>
                )}
                {seller.fssaiLicenseNumber && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 font-inter mb-1">
                      FSSAI License
                    </p>
                    <p className="text-stone-700 font-inter">
                      {safeString(seller.fssaiLicenseNumber)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Export Capabilities */}
          {(seller.certificateOfOriginCapability ||
            seller.phytosanitaryCertificateCapability ||
            seller.packagingCompliance ||
            seller.fumigationCertificateCapability ||
            seller.exportLogisticsPrepared ||
            seller.labTestingCapability) && (
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
                <Globe2 className="w-5 h-5" />
                Export Capabilities
              </h3>
              <div className="space-y-2">
                {seller.certificateOfOriginCapability && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-stone-700 text-sm font-inter">
                      Certificate of Origin
                    </span>
                  </div>
                )}
                {seller.phytosanitaryCertificateCapability && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-stone-700 text-sm font-inter">
                      Phytosanitary Certificate
                    </span>
                  </div>
                )}
                {seller.packagingCompliance && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-stone-700 text-sm font-inter">
                      Packaging Compliance
                    </span>
                  </div>
                )}
                {seller.fumigationCertificateCapability && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-stone-700 text-sm font-inter">
                      Fumigation Certificate
                    </span>
                  </div>
                )}
                {seller.exportLogisticsPrepared && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-stone-700 text-sm font-inter">
                      Export Logistics Ready
                    </span>
                  </div>
                )}
                {seller.labTestingCapability && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-stone-700 text-sm font-inter">
                      Lab Testing Capability
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Food Quality Certifications */}
          {seller.foodQualityCertifications &&
            seller.foodQualityCertifications.length > 0 && (
              <div className="bg-white border border-stone-200 p-6 shadow-sm">
                <h3 className="text-lg font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Food Quality Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {seller.foodQualityCertifications.map(
                    (certification: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-50 text-green-700 text-sm font-inter border border-green-200"
                      >
                        {certification}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Return Policy */}
          {seller.returnPolicy && (
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
                <Box className="w-5 h-5" />
                Return Policy
              </h3>
              <p className="text-stone-700 font-inter leading-relaxed whitespace-pre-line">
                {safeString(seller.returnPolicy)}
              </p>
            </div>
          )}

          {/* Verification Status */}
          {seller.verificationStatus && (
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
                <Award className="w-5 h-5" />
                Verification Status
              </h3>
              <div className="flex items-center gap-2">
                {seller.verificationStatus === "approved" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium font-inter">
                      Verified Seller
                    </span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 text-stone-400" />
                    <span className="text-stone-600 font-inter capitalize">
                      {seller.verificationStatus.replace("_", " ")}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

