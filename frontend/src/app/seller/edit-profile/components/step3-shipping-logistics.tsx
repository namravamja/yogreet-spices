"use client";

interface SellerProfileDataStep3 {
  shippingType: string;
  serviceAreas: string[];
  returnPolicy: string;
}

interface Step3Props {
  data: SellerProfileDataStep3 & Record<string, any>;
  updateData: (updates: Partial<SellerProfileDataStep3>) => void;
  isLoading?: boolean;
}

const SHIPPING_TYPES = [
  "Self Ship",
  "Third Party Logistics (3PL)",
  "Drop Shipping",
  "Marketplace Fulfillment",
];

const SERVICE_AREAS = [
  "Domestic",
  "International",
  "Bulk Orders",
  "Retail Orders",
  "B2B",
  "B2C",
];

export default function Step3ShippingLogistics({ data, updateData }: Step3Props) {
  const handleServiceAreaToggle = (area: string) => {
    const currentAreas = data.serviceAreas || [];
    const updatedAreas = currentAreas.includes(area)
      ? currentAreas.filter((a) => a !== area)
      : [...currentAreas, area];
    updateData({ serviceAreas: updatedAreas });
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-poppins font-light text-yogreet-charcoal mb-4 sm:mb-6">
        Shipping & Logistics
      </h2>

      {/* Shipping Type */}
      <div className="mb-6">
        <label className="block text-sm font-manrope font-medium text-stone-700 mb-3">
          Shipping Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SHIPPING_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateData({ shippingType: type })}
              className={`px-4 py-3 rounded-md text-sm font-inter transition-colors cursor-pointer text-left ${
                data.shippingType === type
                  ? "bg-yogreet-sage text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Service Areas */}
      <div className="mb-6">
        <label className="block text-sm font-manrope font-medium text-stone-700 mb-3">
          Service Areas <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => handleServiceAreaToggle(area)}
              className={`px-4 py-2 rounded-full text-sm font-inter transition-colors cursor-pointer ${
                data.serviceAreas?.includes(area)
                  ? "bg-yogreet-sage text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
        {data.serviceAreas && data.serviceAreas.length > 0 && (
          <p className="mt-2 text-xs text-stone-500 font-inter">
            {data.serviceAreas.length} area{data.serviceAreas.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>

      {/* Return Policy */}
      <div>
        <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
          Return Policy <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={data.returnPolicy || ""}
          onChange={(e) => updateData({ returnPolicy: e.target.value })}
          className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
          placeholder="Describe your return policy..."
        />
      </div>
    </div>
  );
}

