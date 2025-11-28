"use client";

import { useState, useMemo, useEffect } from "react";
import { MapPin, Edit, Trash2, Check, Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import {
  useGetBuyerQuery,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/services/api/buyerApi";

interface Address {
  id: string;
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

interface ShippingAddressesProps {
  buyerData?: any;
  onEdit?: () => void;
  updateData?: (updates: any) => void;
  isLoading?: boolean;
  isEditing?: boolean;
  onSaveComplete?: () => void;
}

export default function ShippingAddresses({ buyerData: buyerDataProp, onEdit, updateData, isLoading: externalLoading, isEditing, onSaveComplete }: ShippingAddressesProps) {
  const router = useRouter();
  // Get addresses from buyer data (matches reference pattern where addresses come with buyer)
  // Only fetch if buyerData prop is not provided
  const { data: fetchedBuyerData, isLoading: isBuyerLoading, isError: isBuyerError, error: buyerError, refetch: refetchBuyer } = useGetBuyerQuery(undefined, {
    skip: !!buyerDataProp, // Skip if buyer data is provided as prop
  });
  // Also use separate query as fallback/for updates
  const { data: addressesData, isLoading: isAddressesLoading, refetch: refetchAddresses } = useGetAddressesQuery(undefined, {
    skip: !buyerDataProp && !fetchedBuyerData, // Skip if buyer data not loaded yet
  });
  
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();

  // Use prop data first, then fetched data, then addresses query
  const finalBuyerData = buyerDataProp || fetchedBuyerData;
  const addresses: Address[] = useMemo(() => {
    const rawAddresses = finalBuyerData?.addresses && Array.isArray(finalBuyerData.addresses)
      ? finalBuyerData.addresses
      : addressesData || [];
    
    // Ensure all IDs are strings (MongoDB ObjectIds are strings)
    return rawAddresses.map((addr: any) => ({
      ...addr,
      id: String(addr.id || addr._id || ''),
    })) as Address[];
  }, [finalBuyerData?.addresses, addressesData]);

  const isLoading = isBuyerLoading || isAddressesLoading;
  const isError = isBuyerError;
  const error = buyerError;

  const refetch = async () => {
    const refetchPromises: Promise<any>[] = [];
    // Only refetch queries that weren't skipped
    // Wrap in try-catch because RTK Query throws error when refetching skipped queries
    if (refetchBuyer && typeof refetchBuyer === 'function') {
      try {
        const result = refetchBuyer();
        if (result) {
          refetchPromises.push(result);
        }
      } catch (error) {
        // Query was skipped, ignore
        console.debug('Buyer query was skipped, cannot refetch');
      }
    }
    if (refetchAddresses && typeof refetchAddresses === 'function') {
      try {
        const result = refetchAddresses();
        if (result) {
          refetchPromises.push(result);
        }
      } catch (error) {
        // Query was skipped, ignore
        console.debug('Addresses query was skipped, cannot refetch');
      }
    }
    if (refetchPromises.length > 0) {
      await Promise.all(refetchPromises);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    firstName: "",
    lastName: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  // Reset form when entering edit mode (Sheet opens)
  useEffect(() => {
    if (isEditing) {
      // Only reset if not currently editing an address
      if (editingId === null) {
        setFormData({
          firstName: "",
          lastName: "",
          street: "",
          apartment: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          phone: "",
          isDefault: addresses.length === 0,
        });
        setShowAddForm(false);
      }
    } else {
      // Reset when Sheet closes
      setEditingId(null);
      setShowAddForm(false);
      setFormData({
        firstName: "",
        lastName: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        isDefault: false,
      });
    }
  }, [isEditing, addresses.length]);

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
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || 
        !formData.city || !formData.state || !formData.postalCode || !formData.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId === null) {
        // Adding new address
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
      } else {
        // Updating existing address
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

      setEditingId(null);
      setShowAddForm(false);
      setFormData({
        firstName: "",
        lastName: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        isDefault: false,
      });
      
      // RTK Query mutations automatically invalidate tags and refetch queries
      // Only manually refetch if needed (mutations handle this automatically)
      try {
        await refetch();
      } catch (error) {
        // Ignore refetch errors - mutations will handle cache invalidation
      }
      
      if (updateData) {
        updateData({ addresses: addresses });
      }
      
      // Call onSaveComplete callback to close Sheet if provided
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || "Failed to save address";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAddressToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    
    try {
      await deleteAddress(addressToDelete).unwrap();
      toast.success("Address deleted successfully");
      // RTK Query mutations automatically invalidate tags and refetch queries
      try {
        await refetch();
      } catch (error) {
        // Ignore refetch errors - mutations will handle cache invalidation
      }
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || "Failed to delete address";
      toast.error(errorMessage);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id).unwrap();
      toast.success("Default address updated");
      // RTK Query mutations automatically invalidate tags and refetch queries
      try {
        await refetch();
      } catch (error) {
        // Ignore refetch errors - mutations will handle cache invalidation
      }
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || "Failed to set default address";
      toast.error(errorMessage);
    }
  };

  // Loading state
  if (isLoading && !isEditing) {
    return (
      <div className="bg-white border border-stone-200 shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-yogreet-sage" />
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
  if (isError && !isEditing) {
    return (
      <div className="bg-white border border-stone-200 shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-yogreet-sage" />
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
              className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode - form for Sheet
  if (isEditing) {
    return (
      <>
      <div className="space-y-6">
        {/* List of existing addresses */}
        {addresses.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-stone-900 mb-4">Existing Addresses</h3>
            <div className="space-y-3">
              {addresses.map((address, index) => (
                <div
                  key={address.id || `address-${index}`}
                  className="border border-stone-200 rounded-lg p-4 bg-stone-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-stone-900">
                          {address.firstName} {address.lastName}
                        </h4>
                        {address.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      {address.street && (
                        <p className="text-stone-600 text-sm mb-1">{address.street}</p>
                      )}
                      {address.apartment && (
                        <p className="text-stone-600 text-sm mb-1">{address.apartment}</p>
                      )}
                      <p className="text-stone-600 text-sm mb-1">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-stone-600 text-sm mb-1">{address.country}</p>
                      {address.phone && (
                        <p className="text-stone-600 text-sm">{address.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          disabled={isSettingDefault || isDeleting || isUpdating}
                          className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Set as default"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleEdit(address);
                          setShowAddForm(false);
                        }}
                        disabled={isSettingDefault || isDeleting || isUpdating || isCreating}
                        className="text-stone-600 hover:text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-2 hover:bg-stone-100 rounded transition-colors"
                        title="Edit address"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(address.id)}
                        disabled={isSettingDefault || isDeleting || isUpdating || isCreating}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Address Button or Form */}
        {!showAddForm && !editingId ? (
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-yogreet-sage transition-colors cursor-pointer"
               onClick={handleAddNew}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-yogreet-sage/10 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-yogreet-sage" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-1">Add New Address</h3>
                <p className="text-sm text-stone-600">Click to add a new shipping address</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-stone-900">
                  {editingId ? "Edit Address" : "Add New Address"}
                </h3>
                {editingId && (
                  <button
                    onClick={handleAddNew}
                    className="text-sm text-yogreet-sage hover:text-yogreet-sage/80 font-medium cursor-pointer"
                  >
                    Add New Instead
                  </button>
                )}
                {!editingId && showAddForm && (
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        firstName: "",
                        lastName: "",
                        street: "",
                        apartment: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: "",
                        phone: "",
                        isDefault: false,
                      });
                    }}
                    className="text-sm text-stone-600 hover:text-stone-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                First Name *
              </label>
                <input
                  type="text"
                  value={formData.firstName || ""}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
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
          </div>
            
          <div className="px-6 pb-6 border-t border-stone-200">
            <div className="flex gap-3 pt-6">
                <button
                  onClick={handleSave}
                  disabled={isCreating || isUpdating}
                  className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(isCreating || isUpdating) ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {editingId ? "Saving..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingId ? "Save Changes" : "Add Address"}
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setShowAddForm(false);
                      setFormData({
                        firstName: "",
                        lastName: "",
                        street: "",
                        apartment: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: "",
                        phone: "",
                        isDefault: false,
                      });
                    }}
                    disabled={isCreating || isUpdating}
                    className="border border-stone-300 text-stone-700 hover:bg-stone-50 px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Edit
                  </button>
                )}
            </div>
          </div>
        </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Address"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
      >
        <p className="text-stone-600">
          Are you sure you want to delete this address? This action cannot be undone.
        </p>
      </ConfirmationModal>
      </>
    );
  }

  // Display mode - show addresses with Edit button
  const hasAddresses = addresses.length > 0;
  const isComplete = hasAddresses;
  const buttonText = isComplete ? "Edit" : "Upload";
  const ButtonIcon = isComplete ? Edit : Upload;

  return (
    <>
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-yogreet-sage" />
            Shipping Addresses
          </h2>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
            >
              <ButtonIcon className="w-4 h-4" />
              {buttonText}
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <p className="text-stone-600 mb-4">No shipping addresses added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <div
                key={address.id || `address-${index}`}
                className="border border-stone-200 rounded-lg p-4 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-start">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Address"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
      >
        <p className="text-stone-600">
          Are you sure you want to delete this address? This action cannot be undone.
        </p>
      </ConfirmationModal>
    </div>
    </>
  );
}
