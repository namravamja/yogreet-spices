"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  Truck,
  Star,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGetSellerProductQuery, useDeleteProductMutation } from "@/services/api/sellerApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EditProductSidebar from "../components/edit-product-sidebar";

// Safe data access utilities
const safeString = (value: any): string => {
  return value ? String(value) : "";
};

const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function SellerProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuth("seller");
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetSellerProductQuery(productId, {
    skip: !isAuthenticated || !productId,
  });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!product?.Review || product.Review.length === 0) return 0;
    const sum = product.Review.reduce(
      (acc: number, review: any) => acc + (review.rating || 0),
      0
    );
    return sum / product.Review.length;
  }, [product]);

  // Get product images
  const images = useMemo(() => {
    if (product?.productImages && product.productImages.length > 0) {
      return product.productImages;
    }
    return ["/placeholder.jpg"];
  }, [product]);

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center py-16">
          <Package className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4 font-poppins">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            Please login to view product details.
          </p>
          <Link
            href="/"
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
            <p className="text-stone-600 font-inter">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center py-16">
          <Package className="w-24 h-24 mx-auto text-red-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4 font-poppins">
            Product Not Found
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            {error && typeof error === "object" && "data" in error
              ? String((error as any).data?.error || "Product not found")
              : "The product you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Link
            href="/seller/products"
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer inline-block"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/seller/products"
          className="inline-flex items-center text-stone-600 hover:text-stone-900 mb-4 transition-colors font-inter"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light text-stone-900 mb-2 font-poppins">
              {safeString(product.productName || "Product")}
            </h1>
            <p className="text-stone-600 font-inter">
              Product ID: {safeString(product.id)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditSidebarOpen(true)}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors flex items-center gap-2 font-manrope cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center gap-2 font-manrope disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-stone-100 overflow-hidden border border-stone-200">
            <Image
              src={images[currentImageIndex] || "/placeholder.jpg"}
              alt={safeString(product.productName || "Product")}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.jpg";
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      (prev) => (prev - 1 + images.length) % images.length
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow-md transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-stone-700" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev + 1) % images.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow-md transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-stone-700" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-square overflow-hidden border-2 transition-all cursor-pointer ${
                    currentImageIndex === index
                      ? "border-yogreet-sage"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <Image
                    src={img || "/placeholder.jpg"}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* About Product */}
          {(product.purityLevel || product.originSource || product.processingMethod || product.shelfLife || product.manufacturingDate || product.expiryDate) && (
            <div className="bg-white border border-stone-200 p-6 shadow-sm">
              <h2 className="text-xl font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
                <Package className="w-5 h-5" />
                About Product
              </h2>
              <div className="space-y-4">
                {product.purityLevel && (
                  <div>
                    <label className="text-sm font-medium text-stone-600 font-inter">
                      Purity Level
                    </label>
                    <p className="text-stone-900 font-manrope">
                      {safeString(product.purityLevel)}
                    </p>
                  </div>
                )}
                {product.originSource && (
                  <div>
                    <label className="text-sm font-medium text-stone-600 font-inter">
                      Origin / Source
                    </label>
                    <p className="text-stone-900 font-manrope">
                      {safeString(product.originSource)}
                    </p>
                  </div>
                )}
                {product.processingMethod && (
                  <div>
                    <label className="text-sm font-medium text-stone-600 font-inter">
                      Processing Method
                    </label>
                    <p className="text-stone-900 font-manrope">
                      {safeString(product.processingMethod)}
                    </p>
                  </div>
                )}
                {product.shelfLife && (
                  <div>
                    <label className="text-sm font-medium text-stone-600 font-inter">
                      Shelf Life
                    </label>
                    <p className="text-stone-900 font-manrope">
                      {safeString(product.shelfLife)}
                    </p>
                  </div>
                )}
                {product.manufacturingDate && (
                  <div>
                    <label className="text-sm font-medium text-stone-600 font-inter">
                      Manufacturing Date (MFD)
                    </label>
                    <p className="text-stone-900 font-manrope">
                      {new Date(product.manufacturingDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {product.expiryDate && (
                  <div>
                    <label className="text-sm font-medium text-stone-600 font-inter">
                      Expiry Date / Best Before
                    </label>
                    <p className="text-stone-900 font-manrope">
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h2 className="text-xl font-medium text-stone-900 mb-4 font-poppins">
              Product Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-600 font-inter">
                  Category
                </label>
                <p className="text-stone-900 font-manrope">
                  {safeString(product.category || "Not specified")}
                  {product.subCategory && (
                    <span className="text-stone-600"> → {safeString(product.subCategory)}</span>
                  )}
                </p>
              </div>
              {product.typeOfSpice && (
                <div>
                  <label className="text-sm font-medium text-stone-600 font-inter">
                    Type of Spice
                  </label>
                  <p className="text-stone-900 font-manrope">
                    {safeString(product.typeOfSpice)}
                  </p>
                </div>
              )}
              {product.form && (
                <div>
                  <label className="text-sm font-medium text-stone-600 font-inter">
                    Form
                  </label>
                  <p className="text-stone-900 font-manrope">
                    {safeString(product.form)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-stone-600 font-inter">
                  Description
                </label>
                <p className="text-stone-900 font-manrope">
                  {safeString(product.shortDescription || "No description")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-stone-900 font-manrope">
                  {averageRating.toFixed(1)} ({product.Review?.length || 0} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Package Pricing */}
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h2 className="text-xl font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Package Pricing
            </h2>
            <div className="space-y-4">
              {product.smallPrice && product.smallWeight && (
                <div className="flex justify-between items-center p-3 bg-stone-50">
                  <div>
                    <p className="font-medium text-stone-900 font-manrope">
                      Small Package
                    </p>
                    <p className="text-sm text-stone-600 font-inter">
                      {safeString(product.smallWeight)} kg
                    </p>
                  </div>
                  <p className="text-lg font-bold text-yogreet-sage font-poppins">
                    ₹{safeNumber(product.smallPrice).toFixed(2)}
                  </p>
                </div>
              )}
              {product.mediumPrice && product.mediumWeight && (
                <div className="flex justify-between items-center p-3 bg-stone-50">
                  <div>
                    <p className="font-medium text-stone-900 font-manrope">
                      Medium Package
                    </p>
                    <p className="text-sm text-stone-600 font-inter">
                      {safeString(product.mediumWeight)} kg
                    </p>
                  </div>
                  <p className="text-lg font-bold text-yogreet-sage font-poppins">
                    ₹{safeNumber(product.mediumPrice).toFixed(2)}
                  </p>
                </div>
              )}
              {product.largePrice && product.largeWeight && (
                <div className="flex justify-between items-center p-3 bg-stone-50">
                  <div>
                    <p className="font-medium text-stone-900 font-manrope">
                      Large Package
                    </p>
                    <p className="text-sm text-stone-600 font-inter">
                      {safeString(product.largeWeight)} kg
                    </p>
                  </div>
                  <p className="text-lg font-bold text-yogreet-sage font-poppins">
                    ₹{safeNumber(product.largePrice).toFixed(2)}
                  </p>
                </div>
              )}
              {!product.smallPrice &&
                !product.mediumPrice &&
                !product.largePrice && (
                  <p className="text-stone-500 font-inter">
                    No pricing information available
                  </p>
                )}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h2 className="text-xl font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-600 font-inter">Shipping Cost:</span>
                <span className="text-stone-900 font-manrope font-medium">
                  ₹{safeNumber(product.shippingCost || "0").toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Product Stats */}
          <div className="bg-white border border-stone-200 p-6 shadow-sm">
            <h2 className="text-xl font-medium text-stone-900 mb-4 font-poppins flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Product Statistics
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-600 font-inter">Created:</span>
                <span className="text-stone-900 font-manrope">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 font-inter">Last Updated:</span>
                <span className="text-stone-900 font-manrope">
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 font-inter">Total Reviews:</span>
                <span className="text-stone-900 font-manrope">
                  {product.Review?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.Review && product.Review.length > 0 && (
        <div className="mt-8 bg-white border border-stone-200 p-6 shadow-sm">
          <h2 className="text-xl font-medium text-stone-900 mb-6 font-poppins flex items-center gap-2">
            <Star className="w-5 h-5" />
            Customer Reviews ({product.Review.length})
          </h2>
          <div className="space-y-4">
            {product.Review.map((review: any) => (
              <div
                key={review.id}
                className="border-b border-stone-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
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
                    <span className="text-sm font-medium text-stone-900 font-manrope">
                      {safeString(
                        review.buyer?.firstName || "Anonymous"
                      )}{" "}
                      {safeString(review.buyer?.lastName || "")}
                    </span>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 font-inter">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-stone-500 font-inter">
                    {review.date
                      ? new Date(review.date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {review.title && (
                  <h4 className="font-medium text-stone-900 mb-1 font-manrope">
                    {safeString(review.title)}
                  </h4>
                )}
                {review.text && (
                  <p className="text-stone-600 font-inter">
                    {safeString(review.text)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Product Sidebar */}
      <EditProductSidebar
        open={isEditSidebarOpen}
        onOpenChange={setIsEditSidebarOpen}
        productId={productId}
        onProductUpdated={() => {
          refetch();
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-stone-900 mb-2 font-poppins">
              Delete Product
            </h3>
            <p className="text-stone-600 mb-6 font-inter">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors font-manrope disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteProduct(productId).unwrap();
                    toast.success("Product deleted successfully");
                    router.push("/seller/products");
                  } catch (error: any) {
                    toast.error(
                      error?.data?.error || error?.data?.message || "Failed to delete product"
                    );
                  } finally {
                    setShowDeleteConfirm(false);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-manrope disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

