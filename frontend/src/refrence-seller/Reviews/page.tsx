"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Star,
  MessageSquare,
  Trash2,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetArtistReviewsQuery,
  useUpdateReviewVerificationStatusMutation,
  useDeleteReviewByArtistMutation,
} from "@/services/api/artistApi";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/app/(auth)/components/auth-modal-provider";

// Safe data access utilities
const safeArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  return [];
};

const safeNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

export default function ArtistReviews() {
  const [filterRating, setFilterRating] = useState("all");
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const { isAuthenticated, isLoading: authLoading } = useAuth("artist");
  const { openArtistLogin } = useAuthModal();

  // RTK Query hooks - only run if authenticated
  const { data, isLoading, error, refetch } = useGetArtistReviewsQuery(
    undefined,
    {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: true,
    }
  );

  // Extract reviews data from cache response
  const reviews = useMemo(() => {
    if (!data) return [];

    let extractedReviews = [];

    // Handle cache response format
    if (data.source === "cache" && data.data) {
      if (Array.isArray(data.data)) {
        extractedReviews = data.data;
      } else if (data.data.reviews && Array.isArray(data.data.reviews)) {
        extractedReviews = data.data.reviews;
      }
    }
    // Handle direct array response
    else if (Array.isArray(data)) {
      extractedReviews = data;
    }
    // Handle object with reviews property
    else if (data.reviews && Array.isArray(data.reviews)) {
      extractedReviews = data.reviews;
    }
    // Handle any other object format - check all properties
    else if (typeof data === "object") {
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          extractedReviews = data[key];
          break;
        }
      }
    }

    return extractedReviews;
  }, [data]);
  const [updateVerificationStatus] =
    useUpdateReviewVerificationStatusMutation();
  const [deleteReview] = useDeleteReviewByArtistMutation();

  // Filter reviews
  const filteredReviews = safeArray(reviews).filter((review: any) => {
    const rating = safeNumber(review?.rating);
    const matchesRating =
      filterRating === "all" || rating.toString() === filterRating;
    return matchesRating;
  });

  const handleVerificationToggle = async (
    reviewId: string,
    currentVerified: boolean
  ) => {
    // Validate inputs
    if (!reviewId || reviewId === "undefined" || reviewId === "null") {
      toast.error("Invalid review ID. Cannot update verification status.");
      return;
    }

    const newVerified = !currentVerified;

    // Set loading state for this specific review
    setLoadingStates((prev) => ({ ...prev, [reviewId]: true }));

    const loadingToast = toast.loading(
      `${newVerified ? "Verifying" : "Unverifying"} review...`
    );

    try {
      const result = await updateVerificationStatus({
        reviewId: reviewId.toString(),
        verified: newVerified,
      }).unwrap();

      toast.success(
        `Review ${newVerified ? "verified" : "unverified"} successfully!`,
        { id: loadingToast }
      );

      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [reviewId]: false }));

      // Force refetch and wait for it to complete
      const refetchResult = await refetch();
    } catch (error: any) {
      console.error("Failed to update verification status:", error);
      setLoadingStates((prev) => ({ ...prev, [reviewId]: false }));
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Failed to update verification status";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    // Validate inputs
    if (!reviewId || reviewId === "undefined" || reviewId === "null") {
      toast.error("Invalid review ID. Cannot delete review.");
      return;
    }

    // Set loading state for this specific review
    setLoadingStates((prev) => ({ ...prev, [`delete_${reviewId}`]: true }));

    const loadingToast = toast.loading("Deleting review...");

    try {
      const result = await deleteReview({
        reviewId: reviewId.toString(),
      }).unwrap();

      toast.success("Review deleted successfully!", { id: loadingToast });

      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [`delete_${reviewId}`]: false }));

      // Force refetch and wait for it to complete
      const refetchResult = await refetch();
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      setLoadingStates((prev) => ({ ...prev, [`delete_${reviewId}`]: false }));
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Failed to delete review";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const renderStars = (rating: number) => {
    const safeRating = safeNumber(rating);
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < safeRating ? "text-yellow-400 fill-current" : "text-stone-300"
        }`}
      />
    ));
  };

  const getUserDisplayName = (buyer: any) => {
    if (buyer?.firstName && buyer?.lastName) {
      return `${buyer.firstName} ${buyer.lastName}`;
    }
    return buyer?.firstName || "Anonymous User";
  };

  // Calculate statistics
  const totalReviews = safeArray(reviews).length;
  const averageRating =
    totalReviews > 0
      ? (
          safeArray(reviews).reduce(
            (acc: number, review: any) => acc + safeNumber(review?.rating),
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";
  const verifiedReviews = safeArray(reviews).filter(
    (review: any) => review?.verified
  ).length;
  const unverifiedReviews = totalReviews - verifiedReviews;

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8">
            Please login to manage your reviews.
          </p>
          <button
            onClick={openArtistLogin}
            className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-6 py-3 font-medium transition-colors cursor-pointer"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600 mx-auto"></div>
          <p className="mt-2 text-stone-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">
            Failed to load reviews. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="text-terracotta-600 hover:text-terracotta-700 underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Reviews</h1>
        <p className="text-stone-600">Manage customer reviews and feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-terracotta-600 mr-3" />
            <div>
              <div className="text-2xl font-semibold text-stone-900">
                {totalReviews}
              </div>
              <div className="text-stone-500 text-sm">Total Reviews</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-semibold text-stone-900">
                {averageRating}
              </div>
              <div className="text-stone-500 text-sm">Average Rating</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <ShieldCheck className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-semibold text-stone-900">
                {verifiedReviews}
              </div>
              <div className="text-stone-500 text-sm">Verified</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <div className="text-2xl font-semibold text-stone-900">
                {unverifiedReviews}
              </div>
              <div className="text-stone-500 text-sm">Unverified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Rating
            </label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 focus:border-terracotta-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {safeArray(filteredReviews).map((review: any) => (
          <div
            key={review?.id || Math.random()}
            className="bg-white border border-stone-200 p-6 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
              <div className="flex items-start mb-4 lg:mb-0">
                <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                  <Image
                    src={
                      review?.buyer?.avatar ||
                      "/Profile.jpg" ||
                      "/placeholder.svg"
                    }
                    alt={getUserDisplayName(review?.buyer)}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-stone-900 mb-1">
                    {review?.product?.productName || "Product"}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {renderStars(review?.rating)}
                    </div>
                    <span className="text-sm text-stone-600">
                      ({safeNumber(review?.rating)}/5)
                    </span>
                  </div>
                  <div className="text-sm text-stone-500">
                    By {getUserDisplayName(review?.buyer)} •{" "}
                    {review?.date
                      ? new Date(review.date).toLocaleDateString()
                      : "Unknown date"}
                    <div
                      className={`inline-block ml-2 text-xs px-2 py-1 rounded-full ${
                        review?.verified
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {review?.verified ? "Verified" : "Unverified"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleVerificationToggle(
                      review?.id || review?._id,
                      Boolean(review?.verified)
                    )
                  }
                  disabled={
                    loadingStates[review?.id || review?._id] || !review?.id
                  }
                  className={`px-3 py-2 text-sm rounded-md transition-colors cursor-pointer disabled:opacity-50 ${
                    review?.verified
                      ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                  title={
                    review?.verified ? "Mark as Unverified" : "Mark as Verified"
                  }
                >
                  {loadingStates[review?.id || review?._id] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current inline mr-1"></div>
                  ) : review?.verified ? (
                    <ShieldCheck className="w-4 h-4 inline mr-1" />
                  ) : (
                    <Shield className="w-4 h-4 inline mr-1" />
                  )}
                  {loadingStates[review?.id || review?._id]
                    ? "Processing..."
                    : review?.verified
                    ? "Verified"
                    : "Unverified"}
                </button>
                <button
                  onClick={() => handleDeleteReview(review?.id || review?._id)}
                  disabled={
                    loadingStates[`delete_${review?.id || review?._id}`] ||
                    !review?.id
                  }
                  className="text-stone-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete Review"
                >
                  {loadingStates[`delete_${review?.id || review?._id}`] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-stone-900 mb-2">
                {review?.title || "No title"}
              </h4>
              <p className="text-stone-600 leading-relaxed">
                {review?.text || "No review text"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-stone-400 mb-4">
            <MessageSquare className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">
            No reviews found
          </h3>
          <p className="text-stone-600">
            {totalReviews === 0
              ? "You don't have any reviews yet. Reviews will appear here once customers start reviewing your products."
              : "Try adjusting your filter criteria"}
          </p>
        </div>
      )}
    </div>
  );
}
