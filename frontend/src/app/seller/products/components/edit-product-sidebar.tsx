"use client";

import { useState, useRef, useEffect } from "react";
import {
  Save,
  Check,
  Package,
  DollarSign,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Step1ProductBasics from "../add/components/step1-product-basics";
import Step2AboutProduct from "../add/components/step2-about-product";
import Step3PriceInventory from "../add/components/step3-price-inventory";
import Step4ImagesShipping from "../add/components/step4-images-shipping";
import Step5Summary from "../add/components/step5-summary";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import type { ProductData } from "../add/page";
import { useUpdateProductMutation, useGetSellerProductQuery } from "@/services/api/sellerApi";

interface EditProductSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onProductUpdated?: () => void;
}

export default function EditProductSidebar({
  open,
  onOpenChange,
  productId,
  onProductUpdated,
}: EditProductSidebarProps) {
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  
  const { data: product, isLoading: isLoadingProduct } = useGetSellerProductQuery(productId, {
    skip: !open || !productId,
  });

  const [productData, setProductData] = useState<ProductData>({
    id: "",
    createdAt: "",
    updatedAt: "",
    productName: "",
    category: "",
    subCategory: "",
    typeOfSpice: "",
    form: "",
    shortDescription: "",
    // About Product
    purityLevel: "",
    originSource: "",
    processingMethod: "",
    shelfLife: "",
    manufacturingDate: "",
    expiryDate: "",
    // Package pricing
    smallPrice: "",
    smallWeight: "",
    mediumPrice: "",
    mediumWeight: "",
    largePrice: "",
    largeWeight: "",
    productImages: [],
    shippingCost: "",
  });

  // Load product data when product is fetched
  useEffect(() => {
    if (product && open) {
      // Format dates for input fields (YYYY-MM-DD)
      const formatDate = (date: string | Date | null | undefined): string => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
      };

      setProductData({
        id: product.id || "",
        createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : "",
        updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : "",
        productName: product.productName || "",
        category: product.category || "",
        subCategory: product.subCategory || "",
        typeOfSpice: product.typeOfSpice || "",
        form: product.form || "",
        shortDescription: product.shortDescription || "",
        // About Product
        purityLevel: product.purityLevel || "",
        originSource: product.originSource || "",
        processingMethod: product.processingMethod || "",
        shelfLife: product.shelfLife || "",
        manufacturingDate: formatDate(product.manufacturingDate),
        expiryDate: formatDate(product.expiryDate),
        // Package pricing
        smallPrice: product.smallPrice || "",
        smallWeight: product.smallWeight || "",
        mediumPrice: product.mediumPrice || "",
        mediumWeight: product.mediumWeight || "",
        largePrice: product.largePrice || "",
        largeWeight: product.largeWeight || "",
        productImages: product.productImages || [],
        shippingCost: product.shippingCost || "",
      });
      setStep(1); // Reset to first step when opening
    }
  }, [product, open]);

  const handleInputChange = (field: string, value: any) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const scrollToTop = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const validateFields = (): boolean => {
    const requiredFields = [
      "productName",
      "category",
      "shortDescription",
      "smallPrice",
      "smallWeight",
      "mediumPrice",
      "mediumWeight",
      "largePrice",
      "largeWeight",
      "shippingCost",
    ];

    const numberFields = [
      "smallPrice",
      "smallWeight",
      "mediumPrice",
      "mediumWeight",
      "largePrice",
      "largeWeight",
      "shippingCost",
    ];

    for (const field of requiredFields) {
      const value = productData[field as keyof ProductData];
      if (!value || value.toString().trim() === "") {
        toast.error(`${field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} is required`);
        return false;
      }

      if (numberFields.includes(field) && isNaN(Number(value))) {
        toast.error(`${field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} must be a valid number`);
        return false;
      }
    }

    if (productData.productImages.length === 0) {
      toast.error("At least one product image is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      scrollToTop();
      return;
    }

    try {
      const formData = new FormData();
      
      // Convert base64 images to File objects and append to FormData
      // Keep existing URLs as-is (they'll be sent as JSON string)
      const newImageFiles: File[] = [];
      const allImageUrls: string[] = [];
      
      for (let i = 0; i < productData.productImages.length; i++) {
        const image = productData.productImages[i];
        
        // Check if it's a base64 string (starts with data:)
        if (typeof image === 'string' && image.startsWith('data:')) {
          try {
            // Convert base64 to blob and then to File
            const response = await fetch(image);
            const blob = await response.blob();
            const file = new File([blob], `product-image-${i + 1}.jpg`, {
              type: blob.type || "image/jpeg",
            });
            newImageFiles.push(file);
            // Also add to URLs array (will be replaced by uploaded URL)
            allImageUrls.push(image);
          } catch (err) {
            console.error(`Failed to convert image ${i + 1}:`, err);
            // If conversion fails, keep as string
            allImageUrls.push(image);
          }
        } else if (typeof image === 'string') {
          // It's already a URL (existing image)
          allImageUrls.push(image);
        }
      }
      
      // Append new images as files (these will be uploaded and get new URLs)
      newImageFiles.forEach((file) => {
        formData.append("productImages", file);
      });
      
      // Append all images as JSON string (existing URLs + new base64 that will be replaced)
      // Backend will merge new uploaded URLs with existing URLs
      formData.append("productImages", JSON.stringify(allImageUrls));
      
      // Append other product data
      const { productImages, id, createdAt, updatedAt, ...otherData } = productData;
      Object.entries(otherData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      await updateProduct({ productId, productData: formData }).unwrap();
      
      toast.success("Product updated successfully!");
      onOpenChange(false);
      if (onProductUpdated) {
        onProductUpdated();
      }
      // Refresh the page to show updated data
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update product:", error);
      toast.error(
        error?.data?.error || error?.data?.message || "Something went wrong while updating product"
      );
    }
  };

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
      setTimeout(() => scrollToTop(), 100);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setTimeout(() => scrollToTop(), 100);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const stepIcons = [
    <Package key="1" className="w-4 h-4 sm:w-5 sm:h-5" />,
    <Package key="2" className="w-4 h-4 sm:w-5 sm:h-5" />,
    <DollarSign key="3" className="w-4 h-4 sm:w-5 sm:h-5" />,
    <ImageIcon key="4" className="w-4 h-4 sm:w-5 sm:h-5" />,
    <Check key="5" className="w-4 h-4 sm:w-5 sm:h-5" />,
  ];

  const stepTitles = [
    "Product Basics",
    "About Product",
    "Price & Inventory",
    "Images",
    "Summary",
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg md:max-w-xl flex flex-col h-full">
        <SheetHeader className="px-10 py-5 border-b border-stone-200 bg-white shrink-0">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="text-xl font-poppins font-light text-stone-900">
              Edit Product
            </SheetTitle>
            <SheetClose
              aria-label="Close"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              Close
            </SheetClose>
          </div>
        </SheetHeader>

        <div ref={formRef} className="px-10 py-6 overflow-y-auto flex-1">
          {isLoadingProduct ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
                <p className="text-stone-600 font-inter">Loading product...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Step Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center relative">
                  {/* Progress line - behind circles */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-200 z-0">
                    <div
                      className="h-full bg-yogreet-sage transition-all duration-300"
                      style={{ width: `${((step - 1) / 4) * 100}%` }}
                    ></div>
                  </div>
                  {/* Step indicators - in front */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center relative z-10 ${
                        i <= step ? "text-yogreet-sage" : "text-stone-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 ${
                          i <= step
                            ? "bg-yogreet-sage/20 text-yogreet-sage border-2 border-yogreet-sage"
                            : "bg-stone-200 text-stone-400 border-2 border-stone-300"
                        }`}
                      >
                        {stepIcons[i - 1]}
                      </div>
                      <div
                        className={`text-xs font-medium text-center ${
                          i <= step ? "text-yogreet-sage" : "text-stone-400"
                        } font-manrope`}
                      >
                        {stepTitles[i - 1]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="bg-white border border-stone-200 p-4 sm:p-6 shadow-sm rounded-md">
                {step === 1 && (
                  <Step1ProductBasics
                    productData={productData}
                    handleInputChange={handleInputChange}
                  />
                )}
                {step === 2 && (
                  <Step2AboutProduct
                    productData={productData}
                    handleInputChange={handleInputChange}
                  />
                )}
                {step === 3 && (
                  <Step3PriceInventory
                    productData={productData}
                    handleInputChange={handleInputChange}
                  />
                )}
                {step === 4 && (
                  <Step4ImagesShipping
                    productData={productData}
                    handleInputChange={handleInputChange}
                  />
                )}
                {step === 5 && <Step5Summary productData={productData} />}

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-stone-200">
                  <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className="px-6 py-2 border cursor-pointer border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto font-manrope"
                  >
                    Previous
                  </button>

                  {step < 5 ? (
                    <button
                      onClick={nextStep}
                      className="px-6 py-2 bg-yogreet-sage cursor-pointer text-white rounded-md hover:bg-yogreet-sage/90 transition-colors w-full sm:w-auto font-manrope"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isUpdating}
                      className="px-6 py-2 bg-yogreet-sage cursor-pointer text-white rounded-md hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto disabled:opacity-50 font-manrope"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isUpdating ? "Updating..." : "Update Product"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

