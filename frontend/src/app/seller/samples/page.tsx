"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  User,
  Truck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Safe data access utilities
const safeArray = <T,>(value: T[] | undefined | null): T[] => {
  return Array.isArray(value) ? value : [];
};

const safeString = (value: any): string => {
  return value ? String(value) : "";
};

const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export interface SampleRequestData {
  id?: string;
  buyerId?: string;
  productId?: string;
  status?: "pending" | "approved" | "rejected" | "shipped";
  notes?: string | null;
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
  buyer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
  };
  product?: {
    id?: string;
    productName?: string;
    productImages?: string[];
    category?: string;
  };
}

export interface SampleRequest {
  id: string;
  requestNumber: string;
  date: string;
  status: "pending" | "approved" | "rejected" | "shipped";
  buyerName: string;
  buyerEmail: string;
  productName: string;
  productImage: string;
  quantity: number;
  notes?: string;
}

// Transform API sample request to component format
const transformApiSampleToSample = (apiSample: SampleRequestData): SampleRequest => {
  return {
    id: safeString(apiSample.id),
    requestNumber: `SR-${safeString(apiSample.id).slice(0, 8).toUpperCase()}`,
    date: safeString(apiSample.createdAt),
    status: (apiSample.status as SampleRequest["status"]) || "pending",
    buyerName:
      `${safeString(apiSample.buyer?.firstName)} ${safeString(
        apiSample.buyer?.lastName
      )}`.trim() || "Unknown Buyer",
    buyerEmail: safeString(apiSample.buyer?.email || "N/A"),
    productName: safeString(apiSample.product?.productName || "Unknown Product"),
    productImage: safeString(apiSample.product?.productImages?.[0] || "/placeholder.jpg"),
    quantity: safeNumber(apiSample.quantity || 1),
    notes: safeString(apiSample.notes || ""),
  };
};

export default function SellerSamplesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const { isAuthenticated, isLoading: authLoading } = useAuth("seller");

  // TODO: Replace with actual API call once backend endpoint is available
  // const {
  //   data: apiResponse,
  //   isLoading,
  //   isError,
  //   error,
  // } = useGetSellerSampleRequestsQuery(
  //   {
  //     page: currentPage,
  //     limit,
  //     status: statusFilter !== "all" ? statusFilter : undefined,
  //   },
  //   {
  //     skip: !isAuthenticated,
  //   }
  // );

  const isLoading = false; // TODO: Set from API call
  const isError = false; // TODO: Set from API call
  const error: any = null; // TODO: Set from API call
  const apiResponse: any = null; // TODO: Get from API call

  // Extract sample requests data
  const sampleRequests: SampleRequest[] = useMemo(() => {
    if (!apiResponse) return [];

    // Handle cache response format: {source: 'cache', data: [...]}
    if (apiResponse.source && apiResponse.data) {
      return safeArray(apiResponse.data).map(transformApiSampleToSample);
    }

    // Handle direct array format
    if (Array.isArray(apiResponse)) {
      return apiResponse.map(transformApiSampleToSample);
    }

    // Handle object with data property
    if (
      typeof apiResponse === "object" &&
      !Array.isArray(apiResponse) &&
      apiResponse.data
    ) {
      return safeArray(apiResponse.data).map(transformApiSampleToSample);
    }

    return [];
  }, [apiResponse]);

  const getStatusIcon = (status: SampleRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: SampleRequest["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-blue-600 bg-blue-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "shipped":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Client-side filtering
  const filteredSamples = sampleRequests.filter((sample) => {
    const matchesSearch =
      sample.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || sample.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-16">
          <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4 font-poppins">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            Please login to view sample requests.
          </p>
          <Link
            href="/"
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer inline-block rounded-md"
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
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-yogreet-sage mx-auto mb-4 animate-spin" />
          <p className="text-stone-600 font-inter">Loading sample requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    console.error("Sample requests loading error:", error);
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2 font-manrope">
            Error loading sample requests
          </h3>
          <p className="text-stone-600 mb-4 font-inter">
            {error && typeof error === "object" && "message" in error
              ? String(error.message)
              : "Something went wrong while fetching sample requests"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-4 py-2 rounded transition-colors cursor-pointer font-manrope"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-stone-900 mb-2 font-poppins">
          Sample Requests
        </h1>
        <p className="text-sm sm:text-base text-stone-600 font-inter">
          Manage sample requests from buyers
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by request number, product, or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-8 py-2 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage bg-white cursor-pointer font-inter"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
      </div>

      {/* Sample Requests List */}
      <div className="space-y-4">
        {filteredSamples.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-200 rounded-md">
            <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2 font-manrope">
              No sample requests found
            </h3>
            <p className="text-stone-600 font-inter">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You haven't received any sample requests yet"}
            </p>
          </div>
        ) : (
          filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className="bg-white border border-stone-200 rounded-md p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Sample Request Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-stone-900 font-manrope">
                      {sample.requestNumber}
                    </h3>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        sample.status
                      )}`}
                    >
                      {getStatusIcon(sample.status)}
                      <span className="ml-1 capitalize font-inter">{sample.status}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 mb-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 shrink-0">
                        <img
                          src={sample.productImage || "/placeholder.jpg"}
                          alt={sample.productName}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 font-manrope">
                          {sample.productName}
                        </p>
                        <p className="text-sm text-stone-600 font-inter">
                          Quantity: {sample.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div className="text-sm text-stone-600 font-inter">
                      <p>
                        <span className="font-medium">Buyer:</span> {sample.buyerName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {sample.buyerEmail}
                      </p>
                      <p>
                        <span className="font-medium">Request Date:</span>{" "}
                        {sample.date
                          ? new Date(sample.date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {sample.notes && (
                    <div className="mt-2 p-3 bg-stone-50 rounded-md">
                      <p className="text-sm text-stone-700 font-inter">
                        <span className="font-medium">Notes:</span> {sample.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:items-end">
                  <button
                    className="px-4 py-2 cursor-pointer bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center text-sm font-manrope"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  {sample.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-manrope"
                        title="Approve"
                      >
                        Approve
                      </button>
                      <button
                        className="px-3 py-1.5 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-manrope"
                        title="Reject"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

