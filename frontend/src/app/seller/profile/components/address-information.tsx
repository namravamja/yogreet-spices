"use client";

import { MapPin } from "lucide-react";

interface Address {
  street?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pinCode?: string | null;
}

interface SellerData {
  businessAddress?: Address | null;
  warehouseAddress?: (Address & { sameAsBusiness?: boolean | null }) | null;
}

interface AddressInformationProps {
  sellerData: SellerData;
}

export default function AddressInformation({
  sellerData,
}: AddressInformationProps) {
  const business = sellerData.businessAddress;
  const warehouse = sellerData.warehouseAddress;

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-yogreet-sage" />
          Address Information
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Business Address */}
        <div>
          <h3 className="text-sm font-manrope font-medium text-stone-700 mb-3">
            Business Address
          </h3>
          {business ? (
            <div className="text-stone-600 space-y-1 font-inter">
              <p>{business.street}</p>
              <p>
                {business.city}, {business.state} {business.pinCode}
              </p>
              <p>{business.country}</p>
            </div>
          ) : (
            <p className="text-stone-500 font-inter">Business address not available.</p>
          )}
        </div>

        {/* Warehouse Address */}
        <div className="pt-6 border-t border-stone-200">
          <h3 className="text-sm font-manrope font-medium text-stone-700 mb-3">
            Warehouse Address
          </h3>
          {warehouse ? (
            warehouse.sameAsBusiness ? (
              <p className="text-stone-600 font-inter">Same as Business Address</p>
            ) : (
              <div className="text-stone-600 space-y-1 font-inter">
                <p>{warehouse.street}</p>
                <p>
                  {warehouse.city}, {warehouse.state} {warehouse.pinCode}
                </p>
                <p>{warehouse.country}</p>
              </div>
            )
          ) : (
            <p className="text-stone-500 font-inter">Warehouse address not available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

