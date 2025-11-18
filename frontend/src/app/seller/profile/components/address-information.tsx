"use client";

import { MapPin, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface Address {
  street?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pinCode?: string | null;
}

interface SellerData {
  businessAddress?: Address | null;
}

interface AddressInformationProps {
  sellerData: SellerData;
  onEdit?: () => void;
}

export default function AddressInformation({
  sellerData,
  onEdit,
}: AddressInformationProps) {
  const router = useRouter();
  const business = sellerData.businessAddress;

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-yogreet-sage" />
            Address Information
          </h2>
          <button
            onClick={() => (onEdit ? onEdit() : router.push("/seller/edit-profile/3"))}
            className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Business Address */}
        <div>
          <h3 className="text-sm font-manrope font-medium text-stone-700 mb-3">
            Business Address
          </h3>
          {business ? (
            <div className="text-stone-600 space-y-1 font-inter">
              {business.street ? <p>{business.street}</p> : null}
              {(business.city || business.state || business.pinCode) ? (
                <p>
                  {[business.city, business.state].filter(Boolean).join(", ")}
                  {business.pinCode ? ` ${business.pinCode}` : ""}
                </p>
              ) : null}
              {business.country ? <p>{business.country}</p> : null}
              {!business.street && !business.city && !business.state && !business.pinCode && !business.country ? (
                <p className="text-stone-500 font-inter">Business address not available.</p>
              ) : null}
            </div>
          ) : (
            <p className="text-stone-500 font-inter">Business address not available.</p>
          )}
        </div>

        {/* Warehouse Address removed */}
      </div>
    </div>
  );
}

