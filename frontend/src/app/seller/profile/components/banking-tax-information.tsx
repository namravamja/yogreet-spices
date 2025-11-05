"use client";

import { CreditCard, Building, FileText } from "lucide-react";

interface SellerData {
  bankAccountName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
}

interface BankingTaxInformationProps {
  sellerData: SellerData;
}

export default function BankingTaxInformation({
  sellerData,
}: BankingTaxInformationProps) {
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-yogreet-sage" />
          Banking & Tax Information
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Banking Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-manrope font-medium text-stone-700 flex items-center mb-4">
              <Building className="w-4 h-4 mr-2 text-yogreet-sage" />
              Banking Details
            </h3>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Account Holder Name *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.bankAccountName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Bank Name *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.bankName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Account Number *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.accountNumber || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                IFSC Code *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.ifscCode || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                UPI ID
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.upiId || "not provided"}
              </p>
            </div>
          </div>

          {/* Tax Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-manrope font-medium text-stone-700 flex items-center mb-4">
              <FileText className="w-4 h-4 mr-2 text-yogreet-sage" />
              Tax Details
            </h3>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                GST Number
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.gstNumber || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                PAN Number *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.panNumber || "not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

