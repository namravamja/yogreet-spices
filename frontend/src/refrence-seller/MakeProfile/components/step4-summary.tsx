import { Check } from "lucide-react";

interface ProfileData {
  // Step 1 data
  fullName: string;
  storeName: string;
  email: string;
  mobile: string;
  businessType: string;
  businessRegistrationNumber: string;
  productCategories: string[];

  // Step 2 data
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
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  gstNumber: string;
  panNumber: string;

  // Step 3 data
  shippingType: string;
  inventoryVolume: string;
  supportContact: string;
  workingHours: string;
  serviceAreas: string[];
  returnPolicy: string;
  termsAgreed: boolean;
}

interface Step4Props {
  data: ProfileData;
}

export default function Step4Summary({ data }: Step4Props) {
  const formatAddress = (address: any) => {
    if (!address) return "Not provided";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.pinCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const formatArray = (arr: string[] | undefined) => {
    if (!Array.isArray(arr) || arr.length === 0) return "None provided";
    return arr.join(", ");
  };

  const maskAccountNumber = (accountNumber: string | undefined) => {
    if (!accountNumber) return "Not provided";
    return "XXXX" + accountNumber.slice(-4);
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-stone-900 mb-4 sm:mb-6">
        Profile Summary
      </h2>

      <div className="bg-stone-50 p-4 sm:p-6 rounded-md mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-medium text-stone-900 mb-3 sm:mb-4">
          Seller Account & Business Basics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="font-medium text-stone-700">
              Full Name / Business Name:
            </span>{" "}
            {data?.fullName || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">Store Name:</span>{" "}
            {data?.storeName || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">Email:</span>{" "}
            {data?.email || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">Mobile:</span>{" "}
            {data?.mobile || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">Business Type:</span>{" "}
            {data?.businessType || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">
              Business Registration Number:
            </span>{" "}
            {data?.businessRegistrationNumber || "Not provided"}
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-stone-700">
              Product Categories:
            </span>{" "}
            {formatArray(data?.productCategories)}
          </div>
        </div>
      </div>

      <div className="bg-stone-50 p-4 sm:p-6 rounded-md mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-medium text-stone-900 mb-3 sm:mb-4">
          Address & Banking Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="md:col-span-2">
            <span className="font-medium text-stone-700">
              Business Address:
            </span>{" "}
            {formatAddress(data?.businessAddress)}
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-stone-700">
              Warehouse Address:
            </span>{" "}
            {data?.warehouseAddress?.sameAsBusiness
              ? "Same as Business Address"
              : formatAddress(data?.warehouseAddress)}
          </div>
          <div>
            <span className="font-medium text-stone-700">
              Bank Account Name:
            </span>{" "}
            {data?.bankAccountName || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">Bank Name:</span>{" "}
            {data?.bankName || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">Account Number:</span>{" "}
            {maskAccountNumber(data?.accountNumber)}
          </div>
          <div>
            <span className="font-medium text-stone-700">IFSC Code:</span>{" "}
            {data?.ifscCode || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">GST Number:</span>{" "}
            {data?.gstNumber || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">PAN Number:</span>{" "}
            {data?.panNumber || "Not provided"}
          </div>
        </div>
      </div>

      <div className="bg-stone-50 p-4 sm:p-6 rounded-md mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-medium text-stone-900 mb-3 sm:mb-4">
          Preferences & Logistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="font-medium text-stone-700">Shipping Type:</span>{" "}
            {data?.shippingType || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">
              Inventory Volume:
            </span>{" "}
            {data?.inventoryVolume || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">Support Contact:</span>{" "}
            {data?.supportContact || "Not provided"}
          </div>
          <div>
            <span className="font-medium text-stone-700">Working Hours:</span>{" "}
            {data?.workingHours || "Not provided"}
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-stone-700">Service Areas:</span>{" "}
            {formatArray(data?.serviceAreas)}
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-stone-700">Return Policy:</span>{" "}
            {data?.returnPolicy || "Not provided"}
          </div>
          <div className="md:col-span-2">
            <span className="font-medium text-stone-700">
              Terms & Conditions:
            </span>{" "}
            {data?.termsAgreed ? "Agreed" : "Not agreed"}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-terracotta-50 border border-terracotta-200 rounded-md">
        <div className="flex items-center">
          <Check className="w-4 sm:w-5 h-4 sm:h-5 text-terracotta-600 mr-2" />
          <p className="text-sm sm:text-base text-terracotta-700">
            Your profile is ready to be submitted. Please review all information
            for accuracy before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
}
