"use client";

import { useState, useRef } from "react";
import {
  Save,
  Check,
  Package,
  DollarSign,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Step1ProductBasics from "../add/components/step1-product-basics";
import Step2AboutProduct from "../add/components/step2-about-product";
import Step3PriceInventory from "../add/components/step3-price-inventory";
import Step4ImagesShipping from "../add/components/step4-images-shipping";
import Step5Summary from "../add/components/step5-summary";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import type { ProductData } from "../add/page";
import { useCreateProductMutation, useGetSellerQuery } from "@/services/api/sellerApi";
import CompleteProfileModal from "./complete-profile-modal";
import AccountUnderReviewModal from "./account-under-review-modal";

interface AddProductSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded?: () => void;
  validationEnabled?: boolean;
}

export default function AddProductSidebar({
  open,
  onOpenChange,
  onProductAdded,
  validationEnabled = true,
}: AddProductSidebarProps) {
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const { data: sellerData } = useGetSellerQuery(undefined);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [showAccountUnderReviewModal, setShowAccountUnderReviewModal] = useState(false);

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
    samplePrice: "",
    sampleWeight: "",
    sampleDescription: "",
    smallPrice: "",
    smallWeight: "",
    smallDescription: "",
    mediumPrice: "",
    mediumWeight: "",
    mediumDescription: "",
    largePrice: "",
    largeWeight: "",
    largeDescription: "",
    productImages: [],
    barcodeImage: "",
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
    if (!productData.barcodeImage) {
      toast.error("Product barcode image is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Skip validation if disabled
    if (validationEnabled) {
      const seller = sellerData?.data || sellerData;
      if (!seller) {
        toast.error("Unable to verify seller information. Please try again.");
        return;
      }

      const profileCompletion = seller.profileCompletion || 0;
      const documentCompletion = seller.documentCompletion || 0;
      const isVerified = seller.isVerified || false;

      // Check if profile or document completion is not 100%
      if (profileCompletion < 100 || documentCompletion < 100) {
        setShowCompleteProfileModal(true);
        return;
      }

      // If both are 100% but seller is not verified
      if (!isVerified) {
        setShowAccountUnderReviewModal(true);
        return;
      }
    }

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
      // Convert barcode image
      if (productData.barcodeImage) {
        try {
          const resp = await fetch(productData.barcodeImage);
          const blob = await resp.blob();
          const file = new File([blob], `barcode-image.jpg`, { type: blob.type || "image/jpeg" });
          formData.append("barcodeImage", file);
        } catch (err) {
          console.error("Failed to convert barcode image:", err);
        }
      }
      
      // Append other product data
      const { productImages, barcodeImage, id, createdAt, updatedAt, ...otherData } = productData;
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
      // Reset form
      setProductData({
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
        samplePrice: "",
        sampleWeight: "",
        sampleDescription: "",
        smallPrice: "",
        smallWeight: "",
        smallDescription: "",
        mediumPrice: "",
        mediumWeight: "",
        mediumDescription: "",
        largePrice: "",
        largeWeight: "",
        largeDescription: "",
        productImages: [],
        barcodeImage: "",
        shippingCost: "",
      });
      setStep(1);
      onOpenChange(false);
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(
        error?.data?.error || error?.data?.message || "Something went wrong while creating product"
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
    // Reset form when closing
    setTimeout(() => {
      setProductData({
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
        samplePrice: "",
        sampleWeight: "",
        sampleDescription: "",
        smallPrice: "",
        smallWeight: "",
        smallDescription: "",
        mediumPrice: "",
        mediumWeight: "",
        mediumDescription: "",
        largePrice: "",
        largeWeight: "",
        largeDescription: "",
        productImages: [],
        barcodeImage: "",
        shippingCost: "",
      });
      setStep(1);
    }, 300);
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
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg md:max-w-xl flex flex-col h-full">
        <SheetHeader className="px-10 py-5 border-b border-stone-200 bg-white shrink-0">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="text-xl font-poppins font-light text-stone-900">
              Add New Product
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
      </SheetContent>
      </Sheet>

      {/* Complete Profile Modal */}
      <CompleteProfileModal
        open={showCompleteProfileModal}
        onOpenChange={setShowCompleteProfileModal}
        profileProgress={(sellerData?.data || sellerData)?.profileCompletion || 0}
        documentVerificationProgress={(sellerData?.data || sellerData)?.documentCompletion || 0}
      />

      {/* Account Under Review Modal */}
      <AccountUnderReviewModal
        open={showAccountUnderReviewModal}
        onOpenChange={setShowAccountUnderReviewModal}
      />
    </>
  );
}
