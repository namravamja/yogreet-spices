"use client";

import { useState } from "react";
import { MapPin, Plus, Edit, Trash2, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function ShippingAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      firstName: "John",
      lastName: "Smith",
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      phone: "+1 (555) 123-4567",
      isDefault: true,
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Address>({
    id: "",
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
      id: "",
      firstName: "",
      lastName: "",
      street: "",
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
    setFormData(address);
    setEditingId(address.id);
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.street || 
        !formData.city || !formData.state || !formData.postalCode || !formData.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isAdding) {
      const newAddress = {
        ...formData,
        id: `addr-${Date.now()}`,
      };
      setAddresses([...addresses, newAddress]);
      toast.success("Address added successfully");
    } else {
      setAddresses(addresses.map(addr => 
        addr.id === editingId ? formData : addr
      ));
      toast.success("Address updated successfully");
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({
      id: "",
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
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      id: "",
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
  };

  const handleDelete = (id: string) => {
    if (addresses.length === 1) {
      toast.error("You must have at least one address");
      return;
    }
    
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success("Address deleted successfully");
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    toast.success("Default address updated");
  };

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
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer flex items-center"
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
                    <p className="text-stone-600 text-sm mb-1">
                      {address.street}
                    </p>
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
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-stone-600 hover:text-stone-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700"
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
                  value={formData.firstName}
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
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter street address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
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
                  value={formData.state}
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
                  value={formData.postalCode}
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
                  value={formData.country}
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
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
                className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                {isAdding ? "Add Address" : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="border border-stone-300 text-stone-700 hover:bg-stone-50 px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer"
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
