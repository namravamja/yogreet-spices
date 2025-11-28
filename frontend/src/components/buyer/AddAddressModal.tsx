"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCreateAddressMutation, useGetAddressesQuery, useGetBuyerQuery } from "@/services/api/buyerApi";

interface AddressFormData {
  firstName: string;
  lastName: string;
  company?: string;
  street?: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddAddressModal({ isOpen, onClose, onSuccess }: AddAddressModalProps) {
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const { data: addressesData } = useGetAddressesQuery(undefined, {
    skip: !isOpen,
  });
  const { data: buyerData } = useGetBuyerQuery(undefined, {
    skip: !isOpen,
  });

  const [formData, setFormData] = useState<AddressFormData>({
    firstName: "",
    lastName: "",
    company: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  // Reset form when modal opens/closes and pre-fill with buyer data
  useEffect(() => {
    if (isOpen) {
      const addresses = addressesData || [];
      // Pre-fill form with buyer profile data if available
      setFormData({
        firstName: buyerData?.firstName || "",
        lastName: buyerData?.lastName || "",
        company: buyerData?.companyName || "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: buyerData?.phone || "",
        isDefault: addresses.length === 0, // Set as default if no addresses exist
      });
    }
  }, [isOpen, addressesData, buyerData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.city || 
        !formData.state || !formData.postalCode || !formData.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const addressData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        company: formData.company?.trim() || undefined,
        street: formData.street?.trim() || undefined,
        apartment: formData.apartment?.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
        phone: formData.phone?.trim() || undefined,
        isDefault: formData.isDefault,
      };

      const response = await createAddress(addressData).unwrap();
      const successMessage = (response as any)?._message || (response as any)?.message || "Address added successfully";
      toast.success(successMessage);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Failed to add address";
      toast.error(errorMessage);
    }
  };

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-medium text-yogreet-charcoal">Add New Address</h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
              />
            </div>

            {/* Street */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Street
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
              />
            </div>

            {/* Apartment */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Apartment
              </label>
              <input
                type="text"
                value={formData.apartment}
                onChange={(e) => handleChange("apartment", e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
                  required
                />
              </div>
            </div>

            {/* Country and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400"
                />
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleChange("isDefault", e.target.checked)}
                className="w-4 h-4 text-yogreet-red border-stone-300 rounded focus:ring-yogreet-red"
              />
              <label htmlFor="isDefault" className="text-sm text-stone-600">
                Set as default address
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium transition-colors cursor-pointer rounded-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-yogreet-red hover:bg-yogreet-red/90 text-white font-medium transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Adding..." : "Add Address"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

