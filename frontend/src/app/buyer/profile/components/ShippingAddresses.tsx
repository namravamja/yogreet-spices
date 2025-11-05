"use client";

import { useState, useMemo } from "react";
import { MapPin, Plus, Edit, Trash2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetBuyerQuery,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/services/api/buyerApi";

interface Address {
  id: number;
  firstName: string;
  lastName: string;
  street?: string | null;
  apartment?: string | null;
  company?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

export default function ShippingAddresses() {
  // Get addresses from buyer data (matches reference pattern where addresses come with buyer)
  const { data: buyerData, isLoading: isBuyerLoading, isError: isBuyerError, error: buyerError, refetch: refetchBuyer } = useGetBuyerQuery(undefined);
  // Also use separate query as fallback/for updates
  const { data: addressesData, isLoading: isAddressesLoading, refetch: refetchAddresses } = useGetAddressesQuery(undefined, {
    skip: !buyerData, // Skip if buyer data not loaded yet
  });
  
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();

  // Use addresses from buyer data first (matches reference), fallback to addresses query
  const addresses: Address[] = useMemo(() => {
    if (buyerData?.addresses && Array.isArray(buyerData.addresses)) {
      return buyerData.addresses as Address[];
    }
    return addressesData || [];
  }, [buyerData?.addresses, addressesData]);

  const isLoading = isBuyerLoading || isAddressesLoading;
  const isError = isBuyerError;
  const error = buyerError;

  const refetch = async () => {
    await Promise.all([refetchBuyer(), refetchAddresses()]);
  };

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  const handleAddNew = () => {
    setFormData({
      firstName: "",
      lastName: "",
      street: "",
      apartment: "",
      company: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      isDefault: addresses.length === 0,
    });
    setIsAdding(true);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street || "",
      apartment: address.apartment || "",
      company: address.company || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || 
        !formData.city || !formData.state || !formData.postalCode || !formData.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (isAdding) {
        await createAddress({
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          street: formData.street || undefined,
          apartment: formData.apartment || undefined,
          company: formData.company || undefined,
          city: formData.city!,
          state: formData.state!,
          postalCode: formData.postalCode!,
          country: formData.country!,
          phone: formData.phone || undefined,
          isDefault: formData.isDefault || false,
        }).unwrap();
        toast.success("Address added successfully");
      } else if (editingId !== null) {
        await updateAddress({
          id: editingId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.street || undefined,
          apartment: formData.apartment || undefined,
          company: formData.company || undefined,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone || undefined,
          isDefault: formData.isDefault,
        }).unwrap();
        toast.success("Address updated successfully");
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({
        firstName: "",
        lastName: "",
        street: "",
        apartment: "",
        company: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        isDefault: false,
      });
      await refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || "Failed to save address";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      firstName: "",
      lastName: "",
      street: "",
      apartment: "",
      company: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      isDefault: false,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress(id).unwrap();
      toast.success("Address deleted successfully");
      await refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || "Failed to delete address";
      toast.error(errorMessage);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id).unwrap();
      toast.success("Default address updated");
      await refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || "Failed to set default address";
      toast.error(errorMessage);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200 shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-yogreet-purple" />
              Shipping Addresses
            </h2>
            <div className="w-32 h-10 bg-stone-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="border border-stone-200 rounded-lg p-4">
                <div className="h-6 bg-stone-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-stone-200 rounded w-48 mb-1 animate-pulse"></div>
                <div className="h-4 bg-stone-200 rounded w-40 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-white border border-stone-200 shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-yogreet-purple" />
            Shipping Addresses
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <p className="font-medium">Failed to load addresses</p>
              <p className="text-sm mt-1">
                {error && "status" in error
                  ? `Error ${error.status}: ${typeof error.data === "object" && error.data && "message" in error.data
                      ? (error.data as { message: string }).message
                      : "Unknown error"}`
                  : "Network error occurred"}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-yogreet-purple" />
            Shipping Addresses
          </h2>
          <button
            onClick={handleAddNew}
            disabled={isAdding || isUpdating || isDeleting || isSettingDefault}
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <p className="text-stone-600 mb-4">No shipping addresses added yet</p>
            <button
              onClick={handleAddNew}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border border-stone-200 rounded-lg p-4 hover:border-stone-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-stone-900">
                        {address.firstName} {address.lastName}
                      </h3>
                      {address.isDefault && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {address.street && (
                      <p className="text-stone-600 text-sm mb-1">
                        {address.street}
                      </p>
                    )}
                    {address.apartment && (
                      <p className="text-stone-600 text-sm mb-1">
                        {address.apartment}
                      </p>
                    )}
                    <p className="text-stone-600 text-sm mb-1">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-stone-600 text-sm mb-1">
                      {address.country}
                    </p>
                    {address.phone && (
                      <p className="text-stone-600 text-sm">
                        {address.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        disabled={isSettingDefault || isDeleting || isUpdating}
                        className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      disabled={isSettingDefault || isDeleting || isUpdating || isCreating}
                      className="text-stone-600 hover:text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      disabled={isSettingDefault || isDeleting || isUpdating || isCreating}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="mt-6 border border-stone-200 rounded-lg p-6 bg-stone-50">
            <h3 className="text-lg font-medium text-stone-900 mb-4">
              {isAdding ? "Add New Address" : "Edit Address"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName || ""}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName || ""}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street || ""}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter street address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Apartment/Suite
                </label>
                <input
                  type="text"
                  value={formData.apartment || ""}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter apartment or suite number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter state"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={formData.postalCode || ""}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter postal code"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country || ""}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDefault || false}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-stone-700">Set as default address</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={isCreating || isUpdating}
                className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isCreating || isUpdating) ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {isAdding ? "Adding..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {isAdding ? "Add Address" : "Save Changes"}
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isCreating || isUpdating}
                className="border border-stone-300 text-stone-700 hover:bg-stone-50 px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
