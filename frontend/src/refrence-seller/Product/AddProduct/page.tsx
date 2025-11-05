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
import Step1ProductBasics from "./components/step1-product-basics";
import Step2PriceInventory from "./components/step2-price-inventory";
import Step3ImagesShipping from "./components/step3-images-shipping";
import Step4Summary from "./components/step4-summary";
import { useCreateProductMutation } from "@/services/api/productApi";
import { useRouter } from "next/navigation";
import { useGetartistQuery } from "@/services/api/artistApi";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/app/(auth)/components/auth-modal-provider";

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
  shortDescription: string;
  sellingPrice: string;
  mrp: string;
  availableStock: string;
  skuCode: string;
  productImages: string[];
  weight: string;
  length: string;
  width: string;
  height: string;
  shippingCost: string;
  deliveryTimeEstimate: string;
  createdAt: string;
  updatedAt: string;
}

interface ArtistResponse {
  source?: string;
  data?: {
    profileProgress?: number;
    isAuthenticated?: boolean;
    [key: string]: any;
  };
}

export default function AddProduct() {
  const [step, setStep] = useState(1);
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const hasRedirected = useRef(false);

  const { isAuthenticated, isLoading: authLoading } = useAuth("artist");
  const { openArtistLogin } = useAuthModal();

  const {
    data: artistResponse,
    isLoading: isArtistLoading,
    refetch,
  } = useGetartistQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Extract artist data from cache response format using useMemo
  const artistData = useMemo(() => {
    if (!artistResponse) return null;

    // Handle cache response format: {source: 'cache', data: {...}}
    if (artistResponse.source && artistResponse.data) {
      return artistResponse.data;
    }

    // Handle direct object format as fallback
    if (
      typeof artistResponse === "object" &&
      !Array.isArray(artistResponse) &&
      artistResponse.data
    ) {
      return artistResponse.data;
    }

    // Handle direct data format
    if (
      typeof artistResponse === "object" &&
      !Array.isArray(artistResponse) &&
      artistResponse.profileProgress
    ) {
      return artistResponse;
    }

    return null;
  }, [artistResponse]);

  // Check profile progress on component mount and artist data change
  useEffect(() => {
    if (
      artistData &&
      !isArtistLoading &&
      !hasRedirected.current &&
      isAuthenticated
    ) {
      const profileProgress = safeNumber(artistData.profileProgress);
      const isArtistAuthenticated = artistData.isAuthenticated || false;

      if (isArtistAuthenticated) {
        if (profileProgress < 92) {
          hasRedirected.current = true;
          toast.error(
            "Please complete your profile to add products. Profile must be at least 90% complete."
          );
          router.push("/Artist/MakeProfile");
          return;
        }
      } else {
        hasRedirected.current = true;
        toast.error("Please login to add products.");
        router.push("/"); // or wherever your login page is
        return;
      }
    }
  }, [artistData, isArtistLoading, router, isAuthenticated]);

  const [productData, setProductData] = useState<ProductData>({
    id: "",
    createdAt: "",
    updatedAt: "",
    productName: "",
    category: "",
    shortDescription: "",
    sellingPrice: "",
    mrp: "",
    availableStock: "",
    skuCode: "",
    productImages: [],
    weight: "",
    length: "",
    width: "",
    height: "",
    shippingCost: "",
    deliveryTimeEstimate: "",
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
      "sellingPrice",
      "mrp",
      "availableStock",
      "skuCode",
      "weight",
      "length",
      "width",
      "height",
      "shippingCost",
      "deliveryTimeEstimate",
    ];

    const numberFields = [
      "sellingPrice",
      "mrp",
      "availableStock",
      "weight",
      "length",
      "width",
      "height",
      "shippingCost",
    ];

    for (const field of requiredFields) {
      const value = productData[field as keyof ProductData];
      if (!value || value.toString().trim() === "") {
        toast.error(`${field} is required`);
        return false;
      }

      if (numberFields.includes(field) && isNaN(Number(value))) {
        toast.error(`${field} must be a valid number`);
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
    // Double-check profile progress before submitting
    if (artistData && safeNumber(artistData.profileProgress) < 92) {
      toast.error(
        "Please complete your profile to add products. Profile must be at least 90% complete."
      );
      router.push("/Artist/MakeProfile");
      return;
    }

    if (!validateFields()) {
      scrollToTop();
      return;
    }

    try {
      const formData = new FormData();

      for (let i = 0; i < productData.productImages.length; i++) {
        const base64String = productData.productImages[i];
        const response = await fetch(base64String);
        const blob = await response.blob();
        const file = new File([blob], `product-image-${i}.jpg`, {
          type: "image/jpeg",
        });
        formData.append("productImages", file);
      }

      const { productImages, id, createdAt, updatedAt, ...otherData } =
        productData;
      Object.entries(otherData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      await createProduct(formData).unwrap();
      toast.success("Product created successfully!");
      router.push("/Artist/Product");
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(
        error?.data?.message || "Something went wrong while creating product"
      );
    }
  };

  const nextStep = () => {
    if (
      step === 1 &&
      (!productData.productName ||
        !productData.category ||
        !productData.shortDescription)
    ) {
      toast.error("Please complete all Product Basics fields.");
      return;
    }
    if (
      step === 2 &&
      (!productData.sellingPrice ||
        !productData.mrp ||
        !productData.availableStock ||
        !productData.skuCode)
    ) {
      toast.error("Please complete all Price & Inventory fields.");
      return;
    }
    if (
      step === 3 &&
      (productData.productImages.length === 0 ||
        !productData.weight ||
        !productData.length ||
        !productData.width ||
        !productData.height ||
        !productData.shippingCost ||
        !productData.deliveryTimeEstimate)
    ) {
      toast.error("Please complete all Images & Shipping fields.");
      return;
    }

    if (step < 4) {
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
    <DollarSign key="2" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <ImageIcon key="3" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <Check key="4" className="w-4 h-4 sm:w-6 sm:h-6" />,
  ];

  const stepTitles = [
    "Product Basics",
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
          <h1 className="text-3xl font-light text-stone-900 mb-4">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8">Please login to add products.</p>
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

  // Show loading state while checking artist data
  if (authLoading || isArtistLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
            <p className="text-stone-600">Checking profile status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-900 mb-2">
          Add New Product
        </h1>
        <p className="text-stone-600">
          Complete all details to list your product on our marketplace
        </p>
      </div>

      <div className="mb-6 sm:mb-10">
        <div className="flex justify-between items-center relative">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex flex-col items-center relative z-10 ${
                i <= step ? "text-sage-600" : "text-stone-400"
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${
                  i <= step
                    ? "bg-sage-100 text-sage-600 border-2 border-sage-600"
                    : "bg-stone-100 text-stone-400 border-2 border-stone-300"
                }`}
              >
                {stepIcons[i - 1]}
              </div>
              <div
                className={`text-xs font-medium text-center ${
                  i <= step ? "text-sage-600" : "text-stone-400"
                } hidden xs:block`}
              >
                Step {i}
              </div>
              <div
                className={`text-xs sm:text-sm font-medium text-center mt-1 ${
                  i <= step ? "text-sage-600" : "text-stone-400"
                } hidden md:block`}
              >
                {stepTitles[i - 1]}
              </div>
            </div>
          ))}
          <div className="absolute top-4 sm:top-6 left-0 right-0 h-0.5 bg-stone-200">
            <div
              className="h-full bg-sage-600 transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
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
          <Step2PriceInventory
            productData={productData}
            handleInputChange={handleInputChange}
          />
        )}
        {step === 3 && (
          <Step3ImagesShipping
            productData={productData}
            handleInputChange={handleInputChange}
          />
        )}
        {step === 4 && <Step4Summary productData={productData} />}

        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-stone-200">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-2 border cursor-pointer border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Previous
          </button>

          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-sage-700 cursor-pointer text-white rounded-md hover:bg-sage-800 transition-colors w-full sm:w-auto"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-sage-700 cursor-pointer text-white rounded-md hover:bg-sage-800 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Publishing..." : "Publish Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
