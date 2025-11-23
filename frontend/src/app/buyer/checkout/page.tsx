"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Plus,
  CreditCard,
  Lock,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHero from "@/components/shared/PageHero";
import {
  useGetCartQuery,
  useGetAddressesQuery,
  useCreateOrderMutation,
  useDeleteAddressMutation,
} from "@/services/api/buyerApi";
import { useAuth } from "@/hooks/useAuth";
import { AddAddressModal } from "@/components/buyer/AddAddressModal";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

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

type PaymentMethod = "credit_card" | "debit_card" | "paypal" | "bank_transfer";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth("buyer");
  const { data: cartData, isLoading: isLoadingCart } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: addressesData, isLoading: isLoadingAddresses, refetch: refetchAddresses } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [deleteAddress, { isLoading: isDeletingAddress }] = useDeleteAddressMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  // Transform cart data
  const cartItems = cartData ? cartData.map((item: any) => {
    const product = item.product || {};
    
    const sampleWeight = parseFloat(product.sampleWeight || "0");
    const smallWeight = parseFloat(product.smallWeight || "0");
    const mediumWeight = parseFloat(product.mediumWeight || "0");
    const largeWeight = parseFloat(product.largeWeight || "0");
    const availableStock = sampleWeight + smallWeight + mediumWeight + largeWeight;
    
    const samplePrice = parseFloat(product.samplePrice || "0");
    const smallPrice = parseFloat(product.smallPrice || "0");
    const mediumPrice = parseFloat(product.mediumPrice || "0");
    const largePrice = parseFloat(product.largePrice || "0");
    
    let pricePerKg = 0;
    if (smallWeight > 0 && smallPrice > 0) {
      pricePerKg = smallPrice / smallWeight;
    } else if (sampleWeight > 0 && samplePrice > 0) {
      pricePerKg = samplePrice / sampleWeight;
    } else if (mediumWeight > 0 && mediumPrice > 0) {
      pricePerKg = mediumPrice / mediumWeight;
    } else if (largeWeight > 0 && largePrice > 0) {
      pricePerKg = largePrice / largeWeight;
    }
    
    return {
      id: item.id,
      productId: item.productId,
      weight: item.quantity,
      product: {
        id: product.id,
        productName: product.productName,
        productImages: product.productImages || [],
        pricePerKg,
        availableStock,
        category: product.category,
        seller: {
          id: product.seller?.id || null,
          fullName: product.seller?.fullName || null,
          companyName: product.seller?.companyName || product.seller?.fullName || "Unknown Seller",
          businessLogo: product.seller?.businessLogo || null,
        },
      },
    };
  }) : [];

  const addresses: Address[] = addressesData || [];

  // Set default address on load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);

  // Handle address added successfully
  const handleAddressAdded = async () => {
    const result = await refetchAddresses();
    const updatedAddresses = result.data || [];
    if (updatedAddresses.length > 0) {
      // Select the newly added address (usually the first one or default one)
      const defaultAddress = updatedAddresses.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(updatedAddresses[0].id);
      }
    }
  };

  // Calculate totals
  const subtotal = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((sum: number, item: any) => {
      const pricePerKg = item.product?.pricePerKg || 0;
      const weight = item.weight || 0;
      return sum + pricePerKg * weight;
    }, 0);
  }, [cartItems]);

  const shipping = subtotal >= 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleDeleteClick = (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent address selection when clicking delete
    setAddressToDelete(addressId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      await deleteAddress(addressToDelete).unwrap();
      toast.success("Address deleted successfully");
      
      // If deleted address was selected, clear selection
      if (selectedAddressId === addressToDelete) {
        setSelectedAddressId(null);
        // Select first available address if any
        const remainingAddresses = addresses.filter(addr => addr.id !== addressToDelete);
        if (remainingAddresses.length > 0) {
          const defaultAddress = remainingAddresses.find(addr => addr.isDefault);
          setSelectedAddressId(defaultAddress ? defaultAddress.id : remainingAddresses[0].id);
        }
      }
      
      refetchAddresses();
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || "Failed to delete address";
      toast.error(errorMessage);
    }
  };

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      toast.error("Please add a shipping address first", {
        duration: 3000,
        icon: "⚠️",
      });
      setShowAddAddressModal(true);
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      await createOrder({
        shippingAddressId: selectedAddressId,
        paymentMethod: paymentMethod,
      }).unwrap();

      toast.success("Order placed successfully!", {
        duration: 3000,
        icon: "✅",
      });

      // Redirect to orders page
      router.push("/buyer/orders");
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || "Failed to place order";
      toast.error(errorMessage);
    }
  };

  if (isLoadingCart || isLoadingAddresses) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-stone-200 p-6 rounded-lg">
                  <div className="h-6 bg-stone-200 rounded w-32 mb-4"></div>
                  <div className="h-32 bg-stone-200 rounded"></div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white border border-stone-200 p-6 rounded-lg">
                  <div className="h-6 bg-stone-200 rounded w-32 mb-6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="text-center py-16">
            <h1 className="text-3xl font-light text-yogreet-charcoal mb-4">
              Your cart is empty
            </h1>
            <p className="text-stone-600 mb-8">
              Add items to your cart to proceed to checkout.
            </p>
            <Link href="/buyer/cart">
              <button className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer rounded-xs">
                View Cart
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <PageHero
        title="Checkout"
        subtitle=""
        description="Review your order and complete your purchase."
        breadcrumb={{
          items: [
            { label: "Home", href: "/" },
            { label: "Cart", href: "/buyer/cart" },
            { label: "Checkout", isActive: true }
          ]
        }}
      />

      <div className="container mx-auto px-2 max-w-7xl">
        <Link href="/buyer/cart" className="inline-flex items-center text-stone-600 hover:text-yogreet-red mb-6 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-stone-200 rounded-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="bg-yogreet-red hover:bg-yogreet-red/90 text-white text-sm font-medium flex items-center gap-1 px-4 py-2 rounded-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Address
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-stone-600">
                    <p className="mb-4">No addresses found. Please add a shipping address.</p>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      className="bg-yogreet-red hover:bg-yogreet-red/90 text-white font-medium px-4 py-2 rounded-xs transition-colors cursor-pointer"
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`p-4 border rounded-xs cursor-pointer transition-colors ${
                        selectedAddressId === address.id
                          ? "border-yogreet-red bg-red-50"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddressId === address.id}
                              onChange={() => setSelectedAddressId(address.id)}
                              className="w-4 h-4 text-yogreet-red border-stone-300 focus:ring-yogreet-red cursor-pointer"
                            />
                            <span className="font-medium text-yogreet-charcoal">
                              {address.firstName} {address.lastName}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs bg-yogreet-sage text-white px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          {address.company && (
                            <p className="text-sm text-stone-600 font-medium mb-1">
                              {address.company}
                            </p>
                          )}
                          {address.street && (
                            <p className="text-sm text-stone-600">
                              {address.street}
                              {address.apartment && `, ${address.apartment}`}
                            </p>
                          )}
                          <p className="text-sm text-stone-600">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-stone-600">{address.country}</p>
                          {address.phone && (
                            <p className="text-sm text-stone-600 mt-1">Phone: {address.phone}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDeleteClick(address.id, e)}
                          disabled={isDeletingAddress}
                          className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-stone-200 rounded-xs p-6">
              <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border rounded-xs cursor-pointer transition-colors ${
                    paymentMethod === "credit_card"
                      ? "border-yogreet-red bg-red-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 text-yogreet-red border-stone-300 focus:ring-yogreet-red mr-3 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-yogreet-charcoal">Credit Card</span>
                    <p className="text-sm text-stone-600">Pay with credit card</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-xs cursor-pointer transition-colors ${
                    paymentMethod === "debit_card"
                      ? "border-yogreet-red bg-red-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="debit_card"
                    checked={paymentMethod === "debit_card"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 text-yogreet-red border-stone-300 focus:ring-yogreet-red mr-3 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-yogreet-charcoal">Debit Card</span>
                    <p className="text-sm text-stone-600">Pay with debit card</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-xs cursor-pointer transition-colors ${
                    paymentMethod === "paypal"
                      ? "border-yogreet-red bg-red-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 text-yogreet-red border-stone-300 focus:ring-yogreet-red mr-3 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-yogreet-charcoal">PayPal</span>
                    <p className="text-sm text-stone-600">Pay with PayPal account</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-xs cursor-pointer transition-colors ${
                    paymentMethod === "bank_transfer"
                      ? "border-yogreet-red bg-red-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-4 h-4 text-yogreet-red border-stone-300 focus:ring-yogreet-red mr-3 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-yogreet-charcoal">Bank Transfer</span>
                    <p className="text-sm text-stone-600">Direct bank transfer</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200 rounded-xs sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-medium text-yogreet-charcoal mb-6">
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item: any) => {
                    const weight = item.weight || 0;
                    const pricePerKg = item.product?.pricePerKg || 0;
                    return (
                      <div key={item.id} className="flex gap-3 pb-4 border-b border-stone-200 last:border-0">
                        <div className="relative w-16 h-16 shrink-0">
                          <Image
                            src={item.product?.productImages?.[0] || "/placeholder.jpg"}
                            alt={item.product?.productName || "Product"}
                            fill
                            className="object-cover rounded-xs"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-yogreet-charcoal text-sm mb-1 line-clamp-2">
                            {item.product?.productName || "Unknown Product"}
                          </h3>
                          <p className="text-xs text-stone-500 mb-1">
                            {weight.toFixed(1)} kg × ${pricePerKg.toFixed(2)}
                          </p>
                          <p className="font-medium text-yogreet-charcoal text-sm">
                            ${(pricePerKg * weight).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="text-yogreet-charcoal">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Shipping</span>
                    <span className="text-yogreet-charcoal">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Tax</span>
                    <span className="text-yogreet-charcoal">${tax.toFixed(2)}</span>
                  </div>
                  <hr className="border-stone-200" />
                  <div className="flex justify-between font-medium text-lg">
                    <span className="text-yogreet-charcoal">Total</span>
                    <span className="text-yogreet-red">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isCreatingOrder || !selectedAddressId || cartItems.length === 0}
                  className="w-full bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium mb-4 transition-colors cursor-pointer rounded-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Place Order
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Lock className="w-3 h-3" />
                  <span>Your payment information is secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSuccess={handleAddressAdded}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setAddressToDelete(null);
        }}
        title="Delete Address"
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeletingAddress}
      >
        <p className="text-stone-600">
          Are you sure you want to delete this address? This action cannot be undone.
        </p>
      </ConfirmationModal>
    </main>
  );
}
