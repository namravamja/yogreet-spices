"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
  Award,
  Users,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetPublicSellerProfileQuery } from "@/services/api/publicApi";
import { PLACEHOLDER_JPG_URL, PLACEHOLDER_SVG_URL } from "@/constants/static-images";

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
  const router = useRouter();
  const sellerId = params.id as string;
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("all");
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [currentStorePhotoIndex, setCurrentStorePhotoIndex] = useState(0);
  const [storePhotoDirection, setStorePhotoDirection] = useState<"left" | "right">("left");
  const [productImageIndices, setProductImageIndices] = useState<{ [key: string]: number }>({});
  const [productHoverStates, setProductHoverStates] = useState<{ [key: string]: boolean }>({});
  const [productDirections, setProductDirections] = useState<{ [key: string]: "left" | "right" }>({});

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

  // Get seller level based on reviews/rating
  const getSellerLevel = () => {
    const reviews = seller?.totalReviews || 0;
    if (reviews >= 100) return "Level 2";
    if (reviews >= 20) return "Level 1";
    return null;
  };

  // Truncate about text
  const aboutText = seller?.about || "";
  const truncatedAbout = aboutText.length > 200 ? aboutText.substring(0, 200) + "..." : aboutText;
  const displayAbout = showFullAbout ? aboutText : truncatedAbout;

  // Store photos navigation
  const storePhotos = seller?.storePhotos || [];
  const hasMultipleStorePhotos = storePhotos.length > 1;

  const handlePreviousStorePhoto = () => {
    if (hasMultipleStorePhotos) {
      setStorePhotoDirection("right");
      setCurrentStorePhotoIndex((prev) => (prev === 0 ? storePhotos.length - 1 : prev - 1));
    }
  };

  const handleNextStorePhoto = () => {
    if (hasMultipleStorePhotos) {
      setStorePhotoDirection("left");
      setCurrentStorePhotoIndex((prev) => (prev === storePhotos.length - 1 ? 0 : prev + 1));
    }
  };

  // Slide variants for store photos
  const slideVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

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

  const sellerName = safeString(seller.companyName || seller.fullName || "Seller");
  const sellerHandle = seller.email ? `@${seller.email.split("@")[0]}` : "@seller";
  const averageRating = seller.averageRating || 0;
  const totalReviews = seller.totalReviews || 0;
  const location = seller.businessAddress
    ? [
        seller.businessAddress.city,
        seller.businessAddress.state,
        seller.businessAddress.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Section */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Picture */}
          <div className="shrink-0">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden">
              {seller.businessLogo ? (
                <Image
                  src={seller.businessLogo}
                        alt={sellerName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = PLACEHOLDER_JPG_URL;
                  }}
                />
              ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Store className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

                {/* Profile Info */}
          <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-semibold text-gray-900 font-poppins">
                      {sellerName}
                  </h1>
                  {seller.verificationStatus === "approved" && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    </div>
                  {seller.fullName && (
                    <p className="text-gray-700 text-sm mb-2 font-inter">
                      @{safeString(seller.fullName)}
                    </p>
                  )}
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-semibold text-gray-900 font-poppins">
                        {averageRating.toFixed(1)}
                      </span>
                </div>
                    <span className="text-gray-600 text-sm font-inter">
                      ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                    </span>
              </div>

                  {/* Seller Level */}
                  {getSellerLevel() && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold font-inter">
                        {getSellerLevel()}
                  </span>
                </div>
                  )}

                  {/* Business Type */}
                  {seller.businessType && (
                    <p className="text-gray-700 mb-2 font-inter italic">
                      {safeString(seller.businessType)}
                    </p>
                  )}

                  {/* Location */}
                  {location && (
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2 font-inter">
                      <MapPin className="w-4 h-4" />
                      <span>{location}</span>
                </div>
              )}

                  {/* Joined Date */}
                  {seller.createdAt && (
                    <div className="text-gray-600 text-sm font-inter">
                      Joined {new Date(seller.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      </div>

          {/* About Section */}
          {seller.about && (
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
                About
              </h2>
                <p className="text-gray-700 leading-relaxed font-inter whitespace-pre-line">
                  {displayAbout}
                </p>
                {aboutText.length > 200 && (
                  <button
                    onClick={() => setShowFullAbout(!showFullAbout)}
                    className="text-yogreet-sage hover:text-yogreet-sage/80 text-sm font-medium mt-2 font-inter transition-colors cursor-pointer"
                  >
                    {showFullAbout ? "Read less" : "Read more"}
                  </button>
                )}
            </div>
          )}

            {/* Store Photos Section */}
            {storePhotos.length > 0 && (
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
                Store Photos
              </h2>
                <div className="relative w-full h-64 sm:h-80 bg-gray-100 overflow-hidden group">
                  <AnimatePresence initial={false} custom={storePhotoDirection}>
                    <motion.div
                      key={currentStorePhotoIndex}
                      custom={storePhotoDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 400, damping: 40 },
                        opacity: { duration: 0.2 },
                      }}
                      className="absolute inset-0"
                  >
                    <Image
                        src={storePhotos[currentStorePhotoIndex]}
                        alt={`Store photo ${currentStorePhotoIndex + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = PLACEHOLDER_JPG_URL;
                      }}
                    />
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  {hasMultipleStorePhotos && (
                    <>
                      <button
                        onClick={handlePreviousStorePhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 p-2 shadow-sm transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={handleNextStorePhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 p-2 shadow-sm transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                      {/* Photo Counter */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 text-sm">
                        {currentStorePhotoIndex + 1} / {storePhotos.length}
                      </div>
                    </>
                  )}
                  </div>
              </div>
            )}

            {/* Product Categories Section */}
            {(productCategories.length > 0 || seller.productCategories) && (
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
                  Product Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(seller.productCategories || productCategories).slice(0, 10).map((category: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-inter transition-colors cursor-pointer"
                    >
                      {category}
                    </span>
                  ))}
                  {(seller.productCategories || productCategories).length > 10 && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-inter">
                      +{(seller.productCategories || productCategories).length - 10} more
                    </span>
                  )}
              </div>
            </div>
          )}

          {/* Products Section */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 font-poppins">
                Products ({filteredProducts.length})
              </h2>

              {/* Category Filter */}
              {productCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedProductCategory("all")}
                    className={`px-4 py-2 border transition-colors font-inter text-sm cursor-pointer ${
                      selectedProductCategory === "all"
                        ? "bg-yogreet-sage text-white border-yogreet-sage"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product: any) => {
                  const productImages = product.productImages && product.productImages.length > 0 
                    ? product.productImages 
                    : [PLACEHOLDER_SVG_URL];
                  const hasMultipleImages = productImages.length > 1;
                  const currentImageIndex = productImageIndices[product.id] || 0;
                  const isHovered = productHoverStates[product.id] || false;
                  const direction = productDirections[product.id] || "right";
                  
                  const productRating =
                      product.Review && product.Review.length > 0
                        ? product.Review.reduce(
                            (sum: number, r: any) => sum + (r.rating || 0),
                            0
                          ) / product.Review.length
                        : 0;
                    const productReviews = product.Review?.length || 0;
                    const smallPrice = parseFloat(product.smallPrice || "0");
                    const smallWeight = parseFloat(product.smallWeight || "1");
                    const pricePerKg = smallWeight > 0 ? smallPrice / smallWeight : smallPrice;

                  const handlePreviousImage = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (hasMultipleImages) {
                      setProductDirections(prev => ({ ...prev, [product.id]: "right" }));
                      setProductImageIndices(prev => ({
                        ...prev,
                        [product.id]: prev[product.id] === 0 ? productImages.length - 1 : (prev[product.id] || 0) - 1
                      }));
                    }
                  };

                  const handleNextImage = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (hasMultipleImages) {
                      setProductDirections(prev => ({ ...prev, [product.id]: "left" }));
                      setProductImageIndices(prev => ({
                        ...prev,
                        [product.id]: (prev[product.id] || 0) === productImages.length - 1 ? 0 : (prev[product.id] || 0) + 1
                      }));
                    }
                  };

                  const slideVariants = {
                    enter: (direction: "left" | "right") => ({
                      x: direction === "left" ? "100%" : "-100%",
                    }),
                    center: {
                      x: 0,
                    },
                    exit: (direction: "left" | "right") => ({
                      x: direction === "left" ? "-100%" : "100%",
                    }),
                  };

                  const handleCardClick = () => {
                    router.push(`/explore/${product.id}`);
                  };

                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-yogreet-light-gray overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 rounded-xs mx-auto w-full"
                      style={{ maxWidth: '320px' }}
                      onMouseEnter={() => setProductHoverStates(prev => ({ ...prev, [product.id]: true }))}
                      onMouseLeave={() => setProductHoverStates(prev => ({ ...prev, [product.id]: false }))}
                    >
                      {/* Image Container */}
                      <div 
                        className="relative w-full h-48 bg-yogreet-light-gray overflow-hidden cursor-pointer"
                        onClick={handleCardClick}
                      >
                        <AnimatePresence initial={false} custom={direction}>
                          <motion.div
                            key={currentImageIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                              x: { type: "spring", stiffness: 400, damping: 40, duration: 0.5 },
                            }}
                            className="absolute inset-0"
                          >
                            <Image 
                              src={productImages[currentImageIndex]} 
                              alt={`${safeString(product.productName)} - Image ${currentImageIndex + 1}`} 
                              fill 
                              className={`object-cover transition-transform duration-300 ${
                                isHovered ? "scale-110" : "scale-100"
                              }`} 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = PLACEHOLDER_SVG_URL;
                              }}
                            />
                          </motion.div>
                        </AnimatePresence>
                        
                        {/* Navigation Arrows */}
                        {hasMultipleImages && (
                          <>
                            {/* Previous Button */}
                            <button
                              onClick={handlePreviousImage}
                              className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-all duration-300 cursor-pointer ${
                                isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                              }`}
                              aria-label="Previous image"
                            >
                              <FiChevronLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            
                            {/* Next Button */}
                            <button
                              onClick={handleNextImage}
                              className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-all duration-300 cursor-pointer ${
                                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
                              }`}
                              aria-label="Next image"
                            >
                              <FiChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                            
                            {/* Image Counter */}
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                              {currentImageIndex + 1} / {productImages.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        {/* Seller Info and Reviews Row */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          {/* Seller Info */}
                          <Link 
                            href={`/buyer/seller/${sellerId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer flex-1 min-w-0"
                          >
                            {seller.businessLogo ? (
                              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                                <Image
                                  src={seller.businessLogo}
                                  alt={sellerName}
                                  fill
                                  className="object-cover"
                                  sizes="24px"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-yogreet-sage shrink-0 flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">{sellerName.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                            <p className="text-sm text-yogreet-warm-gray hover:underline truncate">by {sellerName}</p>
                          </Link>

                          {/* Reviews */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`w-3 h-3 ${i < Math.floor(productRating) ? "fill-yogreet-gold text-yogreet-gold" : "text-gray-300 fill-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-yogreet-warm-gray">({productReviews})</span>
                          </div>
                        </div>

                        {/* Description */}
                        {(product.shortDescription || product.description) && (
                          <p className="text-sm text-yogreet-warm-gray mb-1.5 line-clamp-2 font-inter">
                            {safeString(product.shortDescription || product.description)}
                          </p>
                        )}

                        {/* Price */}
                        <div className="mb-2">
                          <p className="text-base font-poppins font-semibold text-black">
                            From ₹{pricePerKg.toFixed(2)}/kg
                          </p>
                          {smallPrice > 0 && smallWeight > 0 && (
                            <p className="text-xs text-yogreet-warm-gray font-inter mt-0.5">
                              ₹{smallPrice.toFixed(2)} for {smallWeight}kg
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-inter">
                  {selectedProductCategory === "all"
                    ? "No products available"
                    : "No products in this category"}
                </p>
              </div>
            )}
          </div>
          </div>

        {/* Right Sidebar */}
              <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm sticky top-6">
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden mb-3">
                  {seller.businessLogo ? (
                            <Image
                      src={seller.businessLogo}
                      alt={sellerName}
                              fill
                              className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = PLACEHOLDER_JPG_URL;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Store className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 font-poppins">{sellerName}</h3>
                <p className="text-sm text-gray-500 mb-4 font-inter">
                  {seller.verificationStatus === "approved" ? "Verified Exporter" : "Exporter"}
                    </p>
              </div>

              {seller.email ? (
                <a
                  href={`mailto:${seller.email}`}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 font-medium text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 font-inter"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Seller
                </a>
              ) : (
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 font-medium text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 font-inter">
                  <MessageCircle className="w-4 h-4" />
                  Contact Seller
                </button>
          )}
        </div>

            {/* Business Information */}
            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins flex items-center gap-2">
                <Store className="w-5 h-5" />
                Business Information
            </h3>
            <div className="space-y-3">
                {seller.businessType && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-inter mb-1">
                      Business Type
                    </p>
                    <p className="text-gray-700 font-inter">{safeString(seller.businessType)}</p>
                  </div>
                )}
                {location && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-inter mb-1">
                      Location
                    </p>
                    <p className="text-gray-700 font-inter">{location}</p>
                </div>
              )}
              {seller.businessAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-inter mb-1">
                      Address
                    </p>
                    <p className="text-gray-700 font-inter">
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
              )}
                {seller.mobile && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-inter mb-1">
                      Contact
                    </p>
                    <p className="text-gray-700 font-inter">{safeString(seller.mobile)}</p>
                  </div>
                )}
              </div>
            </div>

          {/* Export Capabilities */}
          {(seller.certificateOfOriginCapability ||
            seller.phytosanitaryCertificateCapability ||
            seller.packagingCompliance ||
            seller.fumigationCertificateCapability ||
            seller.exportLogisticsPrepared) && (
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                Export Capabilities
              </h3>
              <div className="space-y-2">
                {seller.certificateOfOriginCapability && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 text-sm font-inter">
                      Certificate of Origin
                    </span>
                  </div>
                )}
                {seller.phytosanitaryCertificateCapability && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 text-sm font-inter">
                      Phytosanitary Certificate
                    </span>
                  </div>
                )}
                {seller.packagingCompliance && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 text-sm font-inter">
                      Packaging Compliance
                    </span>
                  </div>
                )}
                {seller.fumigationCertificateCapability && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 text-sm font-inter">
                      Fumigation Certificate
                    </span>
                  </div>
                )}
                {seller.exportLogisticsPrepared && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 text-sm font-inter">
                      Export Logistics Ready
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Social Links */}
            {seller.socialLinks && 
             (seller.socialLinks.website || 
              seller.socialLinks.facebook || 
              seller.socialLinks.instagram || 
              seller.socialLinks.twitter) && (
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Connect
              </h3>
                <div className="flex items-center gap-4">
                  {seller.socialLinks.website && (
                    <a
                      href={seller.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-yogreet-sage transition-colors"
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
                      className="text-gray-600 hover:text-blue-600 transition-colors"
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
                      className="text-gray-600 hover:text-pink-600 transition-colors"
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
                      className="text-gray-600 hover:text-blue-400 transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                )}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Reviews Section - Bottom of Page */}
        <div className="mt-6 bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 font-poppins flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Customer Reviews {seller.Review && seller.Review.length > 0 && `(${seller.Review.length})`}
          </h2>
          {seller.Review && seller.Review.length > 0 ? (
            <div className="space-y-6">
              {seller.Review.map((review: any) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {review.buyer?.avatar ? (
                        <div className="relative w-10 h-10 bg-gray-200 overflow-hidden">
                          <Image
                            src={review.buyer.avatar}
                            alt={`${review.buyer.firstName} ${review.buyer.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 font-manrope">
                          {safeString(review.buyer?.firstName || "Anonymous")}{" "}
                          {safeString(review.buyer?.lastName || "")}
                        </p>
                        {review.product && (
                          <Link
                            href={`/explore/${review.product.id}`}
                            className="text-sm text-gray-600 hover:text-yogreet-sage font-inter"
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
                                : "text-gray-300"
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
                    <h4 className="font-medium text-gray-900 mb-2 font-manrope">
                      {safeString(review.title)}
                    </h4>
                  )}
                  {review.text && (
                    <p className="text-gray-600 font-inter mb-2">
                      {safeString(review.text)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 font-inter">
                    {review.date
                      ? new Date(review.date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-inter text-lg mb-2">No reviews yet</p>
              <p className="text-gray-500 font-inter text-sm">
                This seller hasn't received any reviews yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
