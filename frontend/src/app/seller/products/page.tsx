"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Filter,
  Eye,
  Package,
  Grid,
  List,
  ChevronDown,
  SlidersHorizontal,
  User,
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

export interface ProductData {
  id?: string;
  productName?: string;
  category?: string;
  shortDescription?: string;
  sellingPrice?: string;
  mrp?: string;
  availableStock?: string;
  skuCode?: string;
  productImages?: string[];
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  shippingCost?: string;
  deliveryTimeEstimate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SellerProductsPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuth("seller");

  // TODO: Replace with actual API call once backend endpoint is available
  // const { data: productResponse, isLoading, error } = useGetProductsBySellerQuery(undefined, {
  //   skip: !isAuthenticated,
  // });

  const isLoading = false; // TODO: Set from API call
  const error: any = null; // TODO: Set from API call
  const productResponse: any = null; // TODO: Get from API call

  // Extract products data from cache response format using useMemo
  const products: ProductData[] = useMemo(() => {
    if (!productResponse) return [];

    // Handle cache response format: {source: 'cache', data: [...]}
    if (productResponse.source && productResponse.data) {
      return safeArray(productResponse.data);
    }

    // Handle direct array format as fallback
    if (Array.isArray(productResponse)) {
      return productResponse;
    }

    // Handle object with data property
    if (
      typeof productResponse === "object" &&
      !Array.isArray(productResponse) &&
      productResponse.data
    ) {
      return safeArray(productResponse.data);
    }

    return [];
  }, [productResponse]);

  const filteredProducts = products.filter((product: ProductData) => {
    const matchesCategory =
      filterCategory === "all" ||
      safeString(product.category) === filterCategory;
    return matchesCategory;
  });

  const categories: string[] = [
    "all",
    ...Array.from(
      new Set(
        products.map((p: ProductData) => safeString(p.category)).filter(Boolean)
      )
    ),
  ];

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="text-center py-16">
          <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            Please login to manage your products.
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

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="text-center text-stone-600 py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
          <p className="font-inter">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("Products loading error:", error);
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2 font-manrope">
            Error loading products
          </h3>
          <p className="text-stone-600 mb-4 font-inter">
            {error && typeof error === "object" && "message" in error
              ? String(error.message)
              : "Something went wrong while fetching your products"}
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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-stone-900 mb-1 sm:mb-2 font-poppins">
            My Products
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-inter">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/seller/products/add"
          className="w-full sm:w-auto bg-yogreet-sage text-white rounded-md px-4 py-2.5 hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center text-sm sm:text-base font-manrope"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full bg-white border border-stone-200 p-3.5 rounded-md flex items-center justify-between text-stone-700 font-inter"
        >
          <span className="flex items-center">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </span>
          <span className="flex items-center text-sm text-stone-500">
            {filteredProducts.length} products
            <ChevronDown
              className={`w-4 h-4 ml-1 transition-transform ${
                showMobileFilters ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`bg-white border border-stone-200 rounded-md shadow-sm mb-6 ${
          showMobileFilters ? "block" : "hidden lg:block"
        }`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="max-w-xs w-full">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage text-sm appearance-none cursor-pointer font-inter"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-4 flex-1">
              <div className="bg-stone-100 rounded-md p-1 flex">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded ${
                    viewMode === "table"
                      ? "bg-white shadow-sm text-yogreet-sage"
                      : "text-stone-500"
                  }`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-yogreet-sage"
                      : "text-stone-500"
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center text-stone-600 text-sm font-inter">
                <Filter className="w-4 h-4 mr-2" />
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-md shadow-sm">
          <div className="text-center py-16 px-6">
            <div className="text-stone-400 mb-6">
              <Package className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
            </div>
            <h3 className="text-xl sm:text-2xl font-medium text-stone-900 mb-3 font-manrope">
              No products found
            </h3>
            <p className="text-stone-600 mb-8 text-sm sm:text-base max-w-md mx-auto font-inter">
              {filterCategory !== "all"
                ? "Try adjusting your filter criteria"
                : "Get started by adding your first product to the catalog"}
            </p>
            <Link
              href="/seller/products/add"
              className="inline-flex items-center px-5 py-2.5 bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors text-sm sm:text-base font-manrope"
            >
              <Plus className="w-4 h-4 mr-2" />
              {filterCategory !== "all"
                ? "Add Product"
                : "Add Your First Product"}
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map((product: ProductData, index) => (
            <div
              key={product.id || index}
              className="bg-white border border-stone-200 rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative">
                <Image
                  src={safeString(product.productImages?.[0] || "/placeholder.jpg")}
                  alt={safeString(product.productName || "Product")}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.jpg";
                  }}
                />
              </div>
              <div className="p-4 sm:p-5">
                <Link href={`/seller/products/${product.id || ""}`}>
                  <h3 className="font-medium text-stone-900 mb-1 truncate hover:text-yogreet-sage transition-colors cursor-pointer font-manrope">
                    {safeString(product.productName || "Unnamed Product")}
                  </h3>
                </Link>
                <p className="text-sm text-stone-500 mb-3 font-inter">
                  {safeString(product.category || "No category")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-yogreet-sage font-poppins">
                    ₹{safeNumber(product.sellingPrice).toFixed(2)}
                  </span>
                  <Link
                    href={`/seller/products/${product.id || ""}`}
                    className="text-stone-400 hover:text-stone-600 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-stone-200 rounded-md shadow-sm">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left py-3.5 px-6 text-sm font-medium text-stone-900 font-manrope">
                  Product
                </th>
                <th className="text-left py-3.5 px-6 text-sm font-medium text-stone-900 font-manrope">
                  Category
                </th>
                <th className="text-left py-3.5 px-6 text-sm font-medium text-stone-900 font-manrope">
                  Price
                </th>
                <th className="text-center py-3.5 px-6 text-sm font-medium text-stone-900 hidden md:table-cell font-manrope">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product: ProductData, index) => (
                <tr
                  key={product.id || index}
                  className="border-b border-stone-100 hover:bg-stone-50 transition"
                >
                  <td className="py-4 px-6 flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src={safeString(
                          product.productImages?.[0] || "/placeholder.jpg"
                        )}
                        alt={safeString(product.productName || "Product")}
                        fill
                        className="object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div>
                      <Link href={`/seller/products/${product.id || ""}`}>
                        <div className="font-medium text-sm text-stone-900 hover:text-yogreet-sage transition-colors cursor-pointer font-manrope">
                          {safeString(product.productName || "Unnamed Product")}
                        </div>
                      </Link>
                      <div className="text-xs text-stone-500 font-inter">
                        ID: {safeString(product.id || "N/A")}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-stone-600 font-inter">
                    {safeString(product.category || "No category")}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-stone-900 font-manrope">
                    ₹{safeNumber(product.sellingPrice).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center hidden md:table-cell">
                    <Link
                      href={`/seller/products/${product.id || ""}`}
                      title="View Product"
                      className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-yogreet-sage/10 text-yogreet-sage rounded-md hover:bg-yogreet-sage hover:text-white transition font-manrope text-sm"
                    >
                      <Eye className="w-5 h-5" />
                      <span className="font-medium">View Product</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

