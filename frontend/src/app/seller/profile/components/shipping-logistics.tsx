"use client";

import { Truck, Package, Globe, Shield } from "lucide-react";

interface SellerData {
  shippingType?: string | null;
  serviceAreas?: string[] | null;
  returnPolicy?: string | null;
}

interface ShippingLogisticsProps {
  sellerData: SellerData;
}

export default function ShippingLogistics({
  sellerData,
}: ShippingLogisticsProps) {
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
          <Truck className="w-5 h-5 mr-2 text-yogreet-sage" />
          Shipping & Logistics
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Shipping Type */}
        <div>
          <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
            <Package className="w-4 h-4 mr-2 text-yogreet-sage" />
            Shipping Type *
          </label>
          <p className="text-stone-600 py-2 font-inter">
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
              sellerData.serviceAreas.map((area, index) => (
                <span
                  key={index}
                  className="bg-yogreet-sage/10 text-yogreet-sage px-3 py-1 rounded-full text-sm font-inter"
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
          <p className="text-stone-600 font-inter">
            {sellerData.returnPolicy || "not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

