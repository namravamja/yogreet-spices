"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHero from "@/components/shared/PageHero";

// Mock data for now - replace with actual API calls later
const mockCartItems = [
  {
    id: "cart-1",
    productId: "prod-1",
    weight: 5.0, // Weight in kg
    product: {
      id: "prod-1",
      productName: "Premium Turmeric Powder",
      productImages: ["/Profile.jpg"],
      sellingPrice: "450.00", // Price per kg
      availableStock: "100", // Available stock in kg
      minQuantity: 1, // Minimum order weight in kg
      category: "Spices",
      artist: {
        fullName: "John Doe",
        storeName: "Spice Master",
      },
    },
  },
  {
    id: "cart-2",
    productId: "prod-2",
    weight: 2.5, // Weight in kg
    product: {
      id: "prod-2",
      productName: "Organic Cumin Seeds",
      productImages: ["/Profile.jpg"],
      sellingPrice: "280.00", // Price per kg
      availableStock: "50", // Available stock in kg
      minQuantity: 1, // Minimum order weight in kg
      category: "Spices",
      artist: {
        fullName: "Jane Smith",
        storeName: "Organic Spices Co",
      },
    },
  },
  {
    id: "cart-3",
    productId: "prod-3",
    weight: 10.0, // Weight in kg
    product: {
      id: "prod-3",
      productName: "Red Chili Powder",
      productImages: ["/Profile.jpg"],
      sellingPrice: "320.00", // Price per kg
      availableStock: "80", // Available stock in kg
      minQuantity: 1, // Minimum order weight in kg
      category: "Spices",
      artist: {
        fullName: "Mike Johnson",
        storeName: "Hot Spices",
      },
    },
  },
];

export default function BuyerCartPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState(
    mockCartItems.map(item => ({
      ...item,
      weight: item.weight ?? Number.parseFloat(item.product?.minQuantity?.toString() || "1")
    }))
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempWeight, setTempWeight] = useState<number | null>(null);

  const handleModifyClick = (productId: string, currentWeight: number) => {
    setEditingItemId(productId);
    setTempWeight(currentWeight);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setTempWeight(null);
  };

  const handleSaveWeight = async (
    productId: string,
    newWeight: number,
    maxStock: number,
    minQuantity: number
  ) => {
    console.log('handleSaveWeight called:', { productId, newWeight, maxStock, minQuantity, editingItemId });
    
    if (isNaN(newWeight) || newWeight <= 0) {
      toast.error(`Please enter a valid weight`, {
        duration: 3000,
        icon: "⚠️",
      });
      return false;
    }

    if (newWeight < minQuantity) {
      toast.error(`Minimum order weight is ${minQuantity} kg`, {
        duration: 3000,
        icon: "⚠️",
      });
      return false;
    }

    // Check if new weight exceeds available stock
    if (newWeight > maxStock) {
      toast.error(`Only ${maxStock} kg available in stock`, {
        duration: 3000,
        icon: "⚠️",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update cart items and exit edit mode in the same state update cycle
      setCartItems(prev => 
        prev.map(item => {
          if (item.productId === productId) {
            return { ...item, weight: newWeight };
          }
          // Ensure weight exists for all items
          if (!item.weight && item.product?.minQuantity) {
            return { ...item, weight: Number.parseFloat(item.product.minQuantity.toString()) || 1 };
          }
          if (!item.weight) {
            return { ...item, weight: 1 };
          }
          return item;
        })
      );
      
      // Edit mode should already be exited by the Save button click handler
      // But ensure it's cleared here as well as a safety measure
      setEditingItemId(prevEditingId => {
        if (prevEditingId === productId) {
          console.log('Exiting edit mode in handleSaveWeight for product:', productId);
          return null;
        }
        return prevEditingId;
      });
      setTempWeight(null);
      
      toast.success("Weight updated", {
        duration: 1500,
        icon: "✅",
      });
      return true;
    } catch (error: any) {
      console.error("Failed to update weight:", error);
      toast.error("Failed to update weight", {
        duration: 3000,
      });
      // Don't exit edit mode on error so user can try again
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      
      toast.success("Item removed from cart", {
        duration: 2000,
        icon: "🗑️",
      });
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCartItems([]);
      toast.success("Cart cleared", {
        duration: 2000,
        icon: "🧹",
      });
    } catch (error: any) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals safely
  const subtotal = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;

    return cartItems.reduce((sum: number, item: any) => {
      const pricePerKg = Number.parseFloat(item.product?.sellingPrice || 0);
      const weight = item.weight || 0;
      return sum + pricePerKg * weight;
    }, 0);
  }, [cartItems]);

  const shipping = subtotal >= 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (isLoading && cartItems.length === 0) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="h-8 bg-stone-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-stone-200 rounded w-32"></div>
              </div>
              <div className="h-10 bg-stone-200 rounded w-24"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white border border-stone-200 p-6 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-stone-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                        <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                        <div className="h-8 bg-stone-200 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white border border-stone-200 p-6 rounded-lg">
                  <div className="h-6 bg-stone-200 rounded w-32 mb-6"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-4 bg-stone-200 rounded"></div>
                    ))}
                  </div>
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
            <ShoppingBag className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-light text-yogreet-charcoal mb-4">
              Your cart is empty
            </h1>
            <p className="text-stone-600 mb-8">
              Discover our beautiful handcrafted spices and add them to your
              cart.
            </p>
            <Link href="/explore">
              <button className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer rounded-xs">
                Start Shopping
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
        title="Shopping Cart"
        subtitle=""
        description="Review your selected spices, adjust weight, and proceed to checkout for seamless trading."
        breadcrumb={{
          items: [
            { label: "Home", href: "/" },
            { label: "Shopping Cart", isActive: true }
          ]
        }}
      />
      
      <div className="container mx-auto px-2 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-stone-600">
              {cartItems.length} {cartItems.length === 1 ? "product" : "products"} in
              your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            disabled={isLoading}
            className="text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 font-medium transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2 inline" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item: any) => {
              const weight = Number.parseFloat(
                item.weight?.toString() || item.product?.minQuantity?.toString() || "1"
              );
              const availableStock = Number.parseFloat(
                item.product?.availableStock || "0"
              );
              const minQuantity = Number.parseFloat(
                item.product?.minQuantity || "1"
              );
              const isWeightAtMax = weight >= availableStock;
              const isOutOfStock = availableStock === 0;
              const pricePerKg = Number.parseFloat(
                item.product?.sellingPrice || "0"
              );

              return (
                <div key={item.id} className="bg-white border border-stone-200 rounded-xs">
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                            <div className="relative w-20 h-20 shrink-0">
                        <Image
                          src={
                            item.product?.productImages?.[0] || "/Profile.jpg"
                          }
                          alt={item.product?.productName || "Product"}
                          fill
                          className="object-cover rounded-xs"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link href={`/explore/${item.product?.id || ""}`}>
                              <h3 className="font-medium text-yogreet-charcoal hover:text-yogreet-red transition-colors">
                                {item.product?.productName || "Unknown Product"}
                              </h3>
                            </Link>
                            <p className="text-sm text-stone-500">
                              By{" "}
                              {item.product?.artist?.fullName ||
                                "Unknown Artist"}
                            </p>
                            <span className="inline-block bg-stone-100 text-stone-800 text-xs px-2 py-1 mt-1 rounded-xs">
                              {item.product?.category || "Uncategorized"}
                            </span>
                          </div>
                          {editingItemId === item.productId ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleCancelEdit}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-sm border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const weightToSave = (tempWeight !== null && tempWeight !== undefined) 
                                    ? tempWeight 
                                    : weight;
                                  console.log('Save button clicked, saving weight:', weightToSave, 'current editingItemId:', editingItemId);
                                  
                                  // Immediately exit edit mode before saving
                                  setEditingItemId(null);
                                  setTempWeight(null);
                                  console.log('Edit mode exited immediately');
                                  
                                  // Then save the weight
                                  await handleSaveWeight(
                                    item.productId,
                                    weightToSave,
                                    availableStock,
                                    minQuantity
                                  );
                                }}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-sm bg-yogreet-red hover:bg-yogreet-red/90 text-white transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleModifyClick(item.productId, weight)}
                                disabled={isLoading || isOutOfStock}
                                className="px-3 py-1.5 text-sm border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Modify
                              </button>
                              <button
                                onClick={() => removeItem(item.productId)}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base text-stone-600 font-medium">Weight (kg):</span>
                            {editingItemId === item.productId ? (
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  value={tempWeight !== null && tempWeight !== undefined ? (tempWeight === 0 ? '' : tempWeight.toString()) : weight.toFixed(1)}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow only numbers and one decimal point
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                      if (value === '' || value === '.') {
                                        setTempWeight(weight); // Keep original weight if empty
                                      } else {
                                        const newWeight = parseFloat(value);
                                        if (!isNaN(newWeight) && newWeight >= 0) {
                                          setTempWeight(newWeight);
                                        }
                                      }
                                    }
                                  }}
                                  onKeyDown={async (e) => {
                                    // Allow: backspace, delete, tab, escape, enter, decimal point
                                    if (
                                      e.key === 'Enter' ||
                                      e.key === 'Escape' ||
                                      e.key === 'Backspace' ||
                                      e.key === 'Delete' ||
                                      e.key === 'Tab' ||
                                      e.key === 'ArrowLeft' ||
                                      e.key === 'ArrowRight' ||
                                      e.key === 'ArrowUp' ||
                                      e.key === 'ArrowDown' ||
                                      e.key === 'Home' ||
                                      e.key === 'End' ||
                                      (e.key === '.' && !e.currentTarget.value.includes('.')) ||
                                      /^[0-9]$/.test(e.key)
                                    ) {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const weightToSave = (tempWeight !== null && tempWeight !== undefined)
                                          ? tempWeight
                                          : weight;
                                        await handleSaveWeight(
                                          item.productId,
                                          weightToSave,
                                          availableStock,
                                          minQuantity
                                        );
                                      } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        handleCancelEdit();
                                      }
                                    } else {
                                      e.preventDefault();
                                    }
                                  }}
                                  autoFocus
                                  disabled={isLoading || isOutOfStock}
                                  className="h-9 w-28 px-3 py-1 text-base font-medium border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                                  placeholder={`${minQuantity} kg`}
                                />
                                <span className="ml-2 text-base text-stone-600">kg</span>
                              </div>
                            ) : (
                              <span className="text-base font-medium text-yogreet-charcoal">
                                {weight.toFixed(1)} kg
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                            <div className="flex flex-col gap-0.5">
                              <p className="text-sm text-stone-500">
                                ₹{pricePerKg.toFixed(2)} per kg
                              </p>
                              <p className="text-xs text-stone-400">
                                {weight.toFixed(1)} kg × ₹{pricePerKg.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium text-yogreet-charcoal text-lg">
                              ₹{(pricePerKg * weight).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200 rounded-xs sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-medium text-yogreet-charcoal mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="text-yogreet-charcoal">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Shipping</span>
                    <span className="text-yogreet-charcoal">
                      {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Tax</span>
                    <span className="text-yogreet-charcoal">₹{tax.toFixed(2)}</span>
                  </div>
                  <hr className="border-stone-200" />
                  <div className="flex justify-between font-medium text-lg">
                    <span className="text-yogreet-charcoal">Total</span>
                    <span className="text-yogreet-red">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-3 mb-6 rounded-xs">
                    <p className="text-sm text-blue-800">
                      Add ₹{(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}

                <Link href="/buyer/checkout">
                  <button className="w-full bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium mb-4 transition-colors cursor-pointer rounded-xs">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  </button>
                </Link>

                <Link href="/explore">
                  <button className="w-full border border-stone-300 text-stone-700 hover:bg-stone-50 px-6 py-3 font-medium transition-colors cursor-pointer rounded-xs">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
