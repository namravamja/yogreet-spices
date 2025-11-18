"use client";

import { Truck, Package, Globe, Shield, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface SellerData {
  shippingType?: string | null;
  serviceAreas?: string[] | null;
  returnPolicy?: string | null;
}

interface ShippingLogisticsProps {
  sellerData: SellerData;
  onEdit?: () => void;
}

export default function ShippingLogistics({
  sellerData,
  onEdit,
}: ShippingLogisticsProps) {
  const router = useRouter();
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <Truck className="w-5 h-5 mr-2 text-yogreet-sage" />
            Shipping & Logistics
          </h2>
          <button
            onClick={() => (onEdit ? onEdit() : router.push("/seller/verify-document/4"))}
            className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Shipping Type */}
        <div>
          <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
            <Package className="w-4 h-4 mr-2 text-yogreet-sage" />
            Shipping Type *
          </label>
          <p className={`py-2 font-inter ${sellerData.shippingType ? "text-stone-600" : "text-red-500"}`}>
            {sellerData.shippingType || "not provided"}
          </p>
        </div>

        {/* Service Areas */}
        <div className="pt-6 border-t border-stone-200">
          <label className="text-sm font-manrope font-medium text-stone-700 mb-3 flex items-center">
            <Globe className="w-4 h-4 mr-2 text-yogreet-sage" />
            Service Areas
          </label>
          <div className="flex flex-wrap gap-2">
            {(sellerData.serviceAreas || []).length > 0 ? (
              (sellerData.serviceAreas || []).map((area, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-inter ${area ? "bg-yogreet-sage/10 text-yogreet-sage" : "bg-red-50 text-red-500"}`}
                >
                  {area || "not provided"}
                </span>
              ))
            ) : (
              <span className="text-stone-500 italic font-inter">
                No service areas specified
              </span>
            )}
          </div>
        </div>

        {/* Return Policy */}
        <div className="pt-6 border-t border-stone-200">
          <label className="text-sm font-manrope font-medium text-stone-700 mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-yogreet-sage" />
            Return Policy
          </label>
          <p className={`font-inter ${sellerData.returnPolicy ? "text-stone-600" : "text-red-500"}`}>
            {sellerData.returnPolicy || "not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

