"use client";

interface SellerProfileDataStep2 {
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  warehouseAddress: {
    sameAsBusiness: boolean;
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
}

interface Step2Props {
  data: SellerProfileDataStep2 & Record<string, any>;
  updateData: (updates: Partial<SellerProfileDataStep2>) => void;
  isLoading?: boolean;
}

export default function Step2AddressInformation({ data, updateData }: Step2Props) {
  const handleBusinessAddressChange = (field: string, value: string) => {
    updateData({
      businessAddress: {
        ...data.businessAddress,
        [field]: value,
      },
    });
  };

  const handleWarehouseAddressChange = (field: string, value: string) => {
    updateData({
      warehouseAddress: {
        ...data.warehouseAddress,
        [field]: value,
      },
    });
  };

  const handleSameAsBusinessToggle = (checked: boolean) => {
    updateData({
      warehouseAddress: {
        ...data.warehouseAddress,
        sameAsBusiness: checked,
      },
    });
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-poppins font-light text-yogreet-charcoal mb-4 sm:mb-6">
        Address Information
      </h2>

      {/* Business Address */}
      <div className="mb-8">
        <h3 className="text-lg font-manrope font-medium text-yogreet-charcoal mb-4">
          Business Address <span className="text-red-500">*</span>
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={data.businessAddress?.street || ""}
              onChange={(e) => handleBusinessAddressChange("street", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
              placeholder="Enter street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={data.businessAddress?.city || ""}
                onChange={(e) => handleBusinessAddressChange("city", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={data.businessAddress?.state || ""}
                onChange={(e) => handleBusinessAddressChange("state", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                placeholder="Enter state"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={data.businessAddress?.country || ""}
                onChange={(e) => handleBusinessAddressChange("country", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                placeholder="Enter country"
              />
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                Pin Code
              </label>
              <input
                type="text"
                value={data.businessAddress?.pinCode || ""}
                onChange={(e) => handleBusinessAddressChange("pinCode", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                placeholder="Enter pin code"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Address */}
      <div className="pt-8 border-t border-stone-200">
        <h3 className="text-lg font-manrope font-medium text-yogreet-charcoal mb-4">
          Warehouse Address
        </h3>

        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.warehouseAddress?.sameAsBusiness || false}
              onChange={(e) => handleSameAsBusinessToggle(e.target.checked)}
              className="w-4 h-4 text-yogreet-sage border-stone-300 rounded focus:ring-yogreet-sage cursor-pointer"
            />
            <span className="ml-2 text-sm font-inter text-stone-700">
              Same as business address
            </span>
          </label>
        </div>

        {!data.warehouseAddress?.sameAsBusiness && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={data.warehouseAddress?.street || ""}
                onChange={(e) => handleWarehouseAddressChange("street", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={data.warehouseAddress?.city || ""}
                  onChange={(e) => handleWarehouseAddressChange("city", e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={data.warehouseAddress?.state || ""}
                  onChange={(e) => handleWarehouseAddressChange("state", e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={data.warehouseAddress?.country || ""}
                  onChange={(e) => handleWarehouseAddressChange("country", e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  placeholder="Enter country"
                />
              </div>
              <div>
                <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
                  Pin Code
                </label>
                <input
                  type="text"
                  value={data.warehouseAddress?.pinCode || ""}
                  onChange={(e) => handleWarehouseAddressChange("pinCode", e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  placeholder="Enter pin code"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

