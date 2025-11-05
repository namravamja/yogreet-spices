"use client";

import React, { use, useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { ProductData } from "./components/types";
import ProductHeader from "./components/ProductHeader";
import ProductInformation from "./components/ProductInformation";
import PricingInventory from "./components/PricingInventory";
import ShippingInformation from "./components/ShippingInformation";
import ProductImages from "./components/ProductImages";
import ActivityLog from "./components/ActivityLog";
import DeleteModal from "./components/DeleteModal";
import { ArrowLeft, Package, User } from "lucide-react";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/services/api/productApi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/app/(auth)/components/auth-modal-provider";

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

interface Params {
  params: Promise<{
    id: string;
  }>;
}

interface ProductResponse {
  source?: string;
  data?: ProductData;
}

function isObjectURL(url: string): boolean {
  return url.startsWith("blob:");
}

function ProductPreview({ params }: Params) {
  const { id } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth("artist");
  const { openArtistLogin } = useAuthModal();

  const {
    data: productResponse,
    isLoading,
    error,
    refetch,
  } = useGetProductByIdQuery(id, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const [deleteProduct] = useDeleteProductMutation();

  const router = useRouter();

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedProduct, setEditedProduct] = useState<ProductData | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const formRef = useRef<HTMLDivElement>(null);

  // Extract product data from cache response format using useMemo
  const product = useMemo(() => {
    if (!productResponse) return null;

    // Handle cache response format: {source: 'cache', data: {...}}
    if (productResponse.source && productResponse.data) {
      return productResponse.data as ProductData;
    }

    // Handle direct object format as fallback
    if (
      typeof productResponse === "object" &&
      !Array.isArray(productResponse) &&
      productResponse.data
    ) {
      return productResponse.data as ProductData;
    }

    // Handle direct data format
    if (
      typeof productResponse === "object" &&
      !Array.isArray(productResponse) &&
      productResponse.id
    ) {
      return productResponse as ProductData;
    }

    return null;
  }, [productResponse]);

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
      setPreviewImages(safeArray(product.productImages));
      setNewFiles([]);
    }
  }, [product]);

  useEffect(() => {
    if (error) {
      console.error("Product loading error:", error);
      toast.error("Failed to load product data");
    }
  }, [error]);

  const handleInputChange = (field: string, value: any): void => {
    if (!editedProduct) return;
    setEditedProduct((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArray]);

      const newImageUrls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newImageUrls]);

      handleInputChange("productImages", [...previewImages, ...newImageUrls]);

      toast.success(`${filesArray.length} image(s) added successfully`);
    }
  };

  const removeImage = (index: number): void => {
    const updatedPreviews = [...previewImages];
    const removedUrl = updatedPreviews[index];
    updatedPreviews.splice(index, 1);

    setPreviewImages(updatedPreviews);

    if (isObjectURL(removedUrl)) {
      const newFileIndex = newFiles.findIndex((file) => {
        const fileUrl = URL.createObjectURL(file);
        const isMatch = fileUrl === removedUrl;
        URL.revokeObjectURL(fileUrl);
        return isMatch;
      });

      if (newFileIndex !== -1) {
        const updatedNewFiles = [...newFiles];
        updatedNewFiles.splice(newFileIndex, 1);
        setNewFiles(updatedNewFiles);
      }

      URL.revokeObjectURL(removedUrl);
    }

    handleInputChange("productImages", updatedPreviews);
    toast.success("Image removed successfully");
  };

  // Convert a file to Base64 string (for preview only)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject("Failed to convert file to base64");
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSaveChanges = async (): Promise<void> => {
    if (!editedProduct) {
      toast.error("No product data to save");
      return;
    }

    const loadingToast = toast.loading("Updating product...");

    try {
      // Create FormData just like in add product
      const formData = new FormData();

      // Handle images - only process if there are new files or image changes
      if (
        newFiles.length > 0 ||
        previewImages.some((img) => isObjectURL(img))
      ) {
        // Add all new files directly
        newFiles.forEach((file, index) => {
          formData.append("productImages", file);
        });

        // For existing images that weren't removed, we need to preserve them
        // by converting them to files only if they're not already handled
        for (let i = 0; i < previewImages.length; i++) {
          const imageUrl = previewImages[i];

          if (!isObjectURL(imageUrl)) {
            // This is an existing image URL - convert to file
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const file = new File([blob], `existing-image-${i}.jpg`, {
                type: blob.type || "image/jpeg",
              });
              formData.append("productImages", file);
            } catch (error) {
              console.warn(
                `Failed to fetch existing image: ${imageUrl}`,
                error
              );
            }
          }
        }
      }

      // Append other product data (excluding arrays and timestamps)
      const {
        productImages,
        id: productId,
        createdAt,
        updatedAt,
        ...otherData
      } = editedProduct;

      Object.entries(otherData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Use the same API call structure as add product
      await updateProduct({ productId: id, updatedData: formData }).unwrap();

      toast.dismiss(loadingToast);
      toast.success("Product updated successfully!");

      setIsEditing(false);
      setNewFiles([]);

      // Clean up object URLs
      previewImages.forEach((url) => {
        if (isObjectURL(url)) {
          URL.revokeObjectURL(url);
        }
      });

      await refetch();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage =
        err?.data?.message || err?.message || "Failed to update product";
      toast.error(errorMessage);
      console.error("Update error:", err);
    }
  };

  const handleDeleteProduct = async () => {
    const loadingToast = toast.loading("Deleting product...");

    try {
      await deleteProduct(id).unwrap();

      toast.dismiss(loadingToast);
      toast.success("Product deleted successfully!");

      setShowDeleteModal(false);

      refetch();

      // Redirect to product list or dashboard
      router.push("/Artist/Product");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage =
        err?.data?.message || err?.error || "Failed to delete product";
      toast.error(errorMessage);
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => {
        if (isObjectURL(url)) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewImages]);

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center py-16">
            <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-light text-stone-900 mb-4">
              Login Required
            </h1>
            <p className="text-stone-600 mb-8">
              Please login to view product details.
            </p>
            <button
              onClick={openArtistLogin}
              className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-6 py-3 font-medium transition-colors cursor-pointer"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("Product loading error:", error);
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl text-center">
          <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Error loading product
          </h2>
          <p className="text-gray-600 mb-6">
            {error && typeof error === "object" && "message" in error
              ? String(error.message)
              : "Failed to load product data"}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex cursor-pointer items-center px-6 py-3 bg-terracotta-600 text-white hover:bg-terracotta-700 transition-colors mr-4"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/Artist/Product")}
            className="inline-flex cursor-pointer items-center px-6 py-3 bg-stone-600 text-white hover:bg-stone-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product || !editedProduct) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/Artist/Product")}
            className="inline-flex cursor-pointer items-center px-6 py-3 bg-terracotta-600 text-white hover:bg-terracotta-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ProductHeader
          product={product}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editedProduct={editedProduct}
          setEditedProduct={setEditedProduct}
          setShowDeleteModal={setShowDeleteModal}
          handleSaveChanges={handleSaveChanges}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <ProductInformation
              product={product}
              editedProduct={editedProduct}
              isEditing={isEditing}
              handleInputChange={handleInputChange}
              categories={[
                "Electronics",
                "Clothing",
                "Home & Kitchen",
                "Beauty & Personal Care",
                "Books",
                "Toys & Games",
                "Sports & Outdoors",
                "Health & Wellness",
                "Jewelry",
                "Handmade",
                "other",
              ]}
            />

            <PricingInventory
              product={product}
              editedProduct={editedProduct}
              isEditing={isEditing}
              handleInputChange={handleInputChange}
            />

            <ShippingInformation
              product={product}
              editedProduct={editedProduct}
              isEditing={isEditing}
              handleInputChange={handleInputChange}
            />

            <ActivityLog product={product} />
          </div>

          <div className="xl:col-span-1">
            <ProductImages
              product={product}
              editedProduct={editedProduct}
              isEditing={isEditing}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
              previewImages={previewImages}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
            />
          </div>
        </div>

        <DeleteModal
          product={product}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleDeleteProduct={handleDeleteProduct}
        />
      </div>
    </div>
  );
}

export default ProductPreview;
