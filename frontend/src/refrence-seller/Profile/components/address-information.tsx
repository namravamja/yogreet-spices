"use client";

import { MapPin } from "lucide-react";

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

interface ArtistData {
  businessAddress: Address | null;
  warehouseAddress: (Address & { sameAsBusiness: boolean }) | null;
}

interface AddressInformationProps {
  artistData: ArtistData;
}

export default function AddressInformation({
  artistData,
}: AddressInformationProps) {
  const business = artistData.businessAddress;
  const warehouse = artistData.warehouseAddress;

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-medium text-stone-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Address Information
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Business Address */}
        <div>
          <h3 className="text-sm font-medium text-stone-700 mb-3">
            Business Address
          </h3>
          {business ? (
            <div className="text-stone-600 space-y-1">
              <p>{business.street}</p>
              <p>
                {business.city}, {business.state} {business.pinCode}
              </p>
              <p>{business.country}</p>
            </div>
          ) : (
            <p className="text-stone-500">Business address not available.</p>
          )}
        </div>

        {/* Warehouse Address */}
        <div className="pt-6 border-t border-stone-200">
          <h3 className="text-sm font-medium text-stone-700 mb-3">
            Warehouse Address
          </h3>
          {warehouse ? (
            warehouse.sameAsBusiness ? (
              <p className="text-stone-600">Same as Business Address</p>
            ) : (
              <div className="text-stone-600 space-y-1">
                <p>{warehouse.street}</p>
                <p>
                  {warehouse.city}, {warehouse.state} {warehouse.pinCode}
                </p>
                <p>{warehouse.country}</p>
              </div>
            )
          ) : (
            <p className="text-stone-500">Warehouse address not available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
