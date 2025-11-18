"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Save,
  Check,
  Package,
  DollarSign,
  ImageIcon,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Step1ProductBasics from "./components/step1-product-basics";
import Step2AboutProduct from "./components/step2-about-product";
import Step3PriceInventory from "./components/step3-price-inventory";
import Step4ImagesShipping from "./components/step4-images-shipping";
import Step5Summary from "./components/step5-summary";
import { useAuth } from "@/hooks/useAuth";
import { useGetSellerQuery, useCreateProductMutation } from "@/services/api/sellerApi";

// Safe data access utilities
const safeString = (value: any): string => {
  return value ? String(value) : "";
};

const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export interface ProductData {
  id: string;
  productName: string;
  category: string;
  subCategory: string;
  typeOfSpice: string;
  form: string;
  shortDescription: string;
  // About Product
  purityLevel: string;
  originSource: string;
  processingMethod: string;
  shelfLife: string;
  manufacturingDate: string;
  expiryDate: string;
  // Package pricing
  smallPrice: string;
  smallWeight: string;
  mediumPrice: string;
  mediumWeight: string;
  largePrice: string;
  largeWeight: string;
  productImages: string[];
  shippingCost: string;
  createdAt: string;
  updatedAt: string;
}

export default function AddProductPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const hasRedirected = useRef(false);

  const { isAuthenticated, isLoading: authLoading } = useAuth("seller");
  const { data: sellerResponse, isLoading: isSellerLoading } = useGetSellerQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  // Extract seller data
  const sellerData = useMemo(() => {
    if (!sellerResponse) return null;

    // Handle cache response format: {source: 'cache', data: {...}}
    if (sellerResponse.source && sellerResponse.data) {
      return sellerResponse.data;
    }

    // Handle direct object format
    if (
      typeof sellerResponse === "object" &&
      !Array.isArray(sellerResponse)
    ) {
      return sellerResponse;
    }

    return null;
  }, [sellerResponse]);

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
      for (let i = 0; i < productData.productImages.length; i++) {
        const base64String = productData.productImages[i];
        try {
          // Convert base64 to blob
          const response = await fetch(base64String);
          const blob = await response.blob();
          const file = new File([blob], `product-image-${i + 1}.jpg`, {
            type: blob.type || "image/jpeg",
          });
          formData.append("productImages", file);
        } catch (err) {
          console.error(`Failed to convert image ${i + 1}:`, err);
          // If conversion fails, try to append as base64 string
          formData.append("productImages", base64String);
        }
      }
      
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
      
      await createProduct(formData).unwrap();
      
      toast.success("Product created successfully!");
      router.push("/seller/products");
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(
        error?.data?.error || error?.data?.message || "Something went wrong while creating product"
      );
    }
  };

  const nextStep = () => {
    // Validation removed for testing purposes
    // TODO: Re-enable validation before production
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

  const stepIcons = [
    <Package key="1" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <Package key="2" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <DollarSign key="3" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <ImageIcon key="4" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <Check key="5" className="w-4 h-4 sm:w-6 sm:h-6" />,
  ];

  const stepTitles = [
    "Product Basics",
    "About Product",
    "Price & Inventory",
    "Images & Shipping",
    "Summary",
  ];

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center py-16">
          <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4 font-poppins">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            Please login to add products.
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

  // Show loading state while checking seller data
  if (authLoading || isSellerLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
            <p className="text-stone-600 font-inter">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-900 mb-2 font-poppins">
          Add New Product
        </h1>
        <p className="text-stone-600 font-inter">
          Complete all details to list your product on our marketplace
        </p>
      </div>

      <div className="mb-6 sm:mb-10">
        <div className="flex justify-between items-center relative">
          {/* Progress line - behind circles */}
          <div className="absolute top-4 sm:top-6 left-0 right-0 h-0.5 bg-stone-200 z-0">
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
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${
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
                } hidden xs:block font-manrope`}
              >
                Step {i}
              </div>
              <div
                className={`text-xs sm:text-sm font-medium text-center mt-1 ${
                  i <= step ? "text-yogreet-sage" : "text-stone-400"
                } hidden md:block font-manrope`}
              >
                {stepTitles[i - 1]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 p-4 sm:p-6 md:p-8 shadow-sm rounded-md">
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
              disabled={isCreating}
              className="px-6 py-2 bg-yogreet-sage cursor-pointer text-white rounded-md hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto disabled:opacity-50 font-manrope"
            >
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? "Publishing..." : "Publish Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

