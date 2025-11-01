"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ArrowRight,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHero from "@/components/shared/PageHero";

// Mock data for now - replace with actual API calls later
const mockSampleItems = [
  {
    id: "sample-1",
    productId: "prod-1",
    weight: 50, // Weight in grams
    product: {
      id: "prod-1",
      productName: "Premium Turmeric Powder",
      productImages: ["/Profile.jpg"],
      sellingPrice: "450.00", // Price per kg
      category: "Spices",
      artist: {
        fullName: "John Doe",
        storeName: "Spice Master",
      },
    },
  },
  {
    id: "sample-2",
    productId: "prod-2",
    weight: 100, // Weight in grams
    product: {
      id: "prod-2",
      productName: "Organic Cumin Seeds",
      productImages: ["/Profile.jpg"],
      sellingPrice: "280.00", // Price per kg
      category: "Spices",
      artist: {
        fullName: "Jane Smith",
        storeName: "Organic Spices Co",
      },
    },
  },
  {
    id: "sample-3",
    productId: "prod-3",
    weight: 250, // Weight in grams
    product: {
      id: "prod-3",
      productName: "Red Chili Powder",
      productImages: ["/Profile.jpg"],
      sellingPrice: "320.00", // Price per kg
      category: "Spices",
      artist: {
        fullName: "Mike Johnson",
        storeName: "Hot Spices",
      },
    },
  },
];

export default function BuyerSamplesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sampleItems, setSampleItems] = useState(
    mockSampleItems.map(item => ({
      ...item,
      weight: item.weight ?? 50
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
    minQuantity: number = 50,
    maxWeight: number = 500
  ) => {
    console.log('handleSaveWeight called:', { productId, newWeight, minQuantity, maxWeight, editingItemId });
    
    if (isNaN(newWeight) || newWeight <= 0) {
      toast.error(`Please enter a valid weight`, {
        duration: 3000,
        icon: "⚠️",
      });
      return false;
    }

    if (newWeight < minQuantity) {
      toast.error(`Minimum sample weight is ${minQuantity} g`, {
        duration: 3000,
        icon: "⚠️",
      });
      return false;
    }

    if (newWeight > maxWeight) {
      toast.error(`Maximum sample weight is ${maxWeight} g`, {
        duration: 3000,
        icon: "⚠️",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update sample items and exit edit mode in the same state update cycle
      setSampleItems(prev => 
        prev.map(item => {
          if (item.productId === productId) {
            return { ...item, weight: newWeight };
          }
          if (!item.weight) {
            return { ...item, weight: 50 };
          }
          return item;
        })
      );
      
      // Edit mode should already be exited by the Save button click handler
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
      
      setSampleItems(prev => prev.filter(item => item.productId !== productId));
      
      toast.success("Sample removed from collection", {
        duration: 2000,
        icon: "🗑️",
      });
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove sample", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearSamples = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSampleItems([]);
      toast.success("Samples cleared", {
        duration: 2000,
        icon: "🧹",
      });
    } catch (error: any) {
      console.error("Failed to clear samples:", error);
      toast.error("Failed to clear samples", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals safely (for samples, we might not charge, but calculate for display)
  const subtotal = useMemo(() => {
    if (!sampleItems || sampleItems.length === 0) return 0;

    return sampleItems.reduce((sum: number, item: any) => {
      const pricePerKg = Number.parseFloat(item.product?.sellingPrice || 0);
      const weightInKg = (item.weight || 0) / 1000; // Convert grams to kg
      return sum + pricePerKg * weightInKg;
    }, 0);
  }, [sampleItems]);

  if (isLoading && sampleItems.length === 0) {
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

  if (sampleItems.length === 0) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="text-center py-16">
            <Package className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-light text-yogreet-charcoal mb-4">
              Your samples collection is empty
            </h1>
            <p className="text-stone-600 mb-8">
              Discover our beautiful handcrafted spices and request samples to your collection.
            </p>
            <Link href="/explore">
              <button className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer rounded-xs">
                Explore Products
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
        title="My Samples"
        subtitle=""
        description="Review your requested samples, adjust weight, and manage your sample collection."
        breadcrumb={{
          items: [
            { label: "Home", href: "/" },
            { label: "My Samples", isActive: true }
          ]
        }}
      />
      
      <div className="container mx-auto px-2 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-stone-600">
              {sampleItems.length} {sampleItems.length === 1 ? "sample" : "samples"} in
              your collection
            </p>
          </div>
          <button
            onClick={clearSamples}
            disabled={isLoading}
            className="text-yogreet-sage border border-yogreet-sage/30 hover:bg-yogreet-sage/10 px-4 py-2 font-medium transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2 inline" />
            Clear Samples
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sample Items */}
          <div className="lg:col-span-2 space-y-4">
            {sampleItems.map((item: any) => {
              const weight = Number.parseFloat(
                item.weight?.toString() || "50"
              );
              const minQuantity = 50; // Minimum sample weight in grams
              const maxWeight = 500; // Maximum sample weight in grams
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
                              <h3 className="font-medium text-yogreet-charcoal hover:text-yogreet-sage transition-colors">
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
                                    minQuantity,
                                    maxWeight
                                  );
                                }}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-sm bg-yogreet-sage hover:bg-yogreet-sage/90 text-white transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleModifyClick(item.productId, weight)}
                                disabled={isLoading}
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
                          <div className="flex flex-col gap-2">
                            <span className="text-base text-stone-600 font-medium">Weight (g):</span>
                            {editingItemId === item.productId ? (
                              <div className="flex flex-col gap-3">
                                {/* Weight Options */}
                                <div className="flex gap-3 flex-wrap">
                                  <button
                                    onClick={() => {
                                      const newWeight = 50;
                                      setTempWeight(newWeight);
                                    }}
                                    className={`px-3 py-1 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                                      (tempWeight !== null && tempWeight !== undefined && tempWeight === 50) || (tempWeight === null && weight === 50)
                                        ? "border-yogreet-sage bg-yogreet-sage/10 text-yogreet-sage"
                                        : "border-gray-300 hover:border-yogreet-sage/50"
                                    }`}
                                  >
                                    <div className="font-semibold text-xs">50 g</div>
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      const newWeight = 100;
                                      setTempWeight(newWeight);
                                    }}
                                    className={`px-3 py-0.5 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                                      (tempWeight !== null && tempWeight !== undefined && tempWeight === 100) || (tempWeight === null && weight === 100)
                                        ? "border-yogreet-sage bg-yogreet-sage/10 text-yogreet-sage"
                                        : "border-gray-300 hover:border-yogreet-sage/50"
                                    }`}
                                  >
                                    <div className="font-semibold text-xs">100 g</div>
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      const newWeight = 250;
                                      setTempWeight(newWeight);
                                    }}
                                    className={`px-3 py-0.5 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                                      (tempWeight !== null && tempWeight !== undefined && tempWeight === 250) || (tempWeight === null && weight === 250)
                                        ? "border-yogreet-sage bg-yogreet-sage/10 text-yogreet-sage"
                                        : "border-gray-300 hover:border-yogreet-sage/50"
                                    }`}
                                  >
                                    <div className="font-semibold text-xs">250 g</div>
                                  </button>

                                  <button
                                    onClick={() => {
                                      // Set to custom mode - show input
                                      if (tempWeight === null || tempWeight === undefined || (tempWeight !== 50 && tempWeight !== 100 && tempWeight !== 250)) {
                                        // Already in custom mode, don't change
                                      } else {
                                        // Switch to custom, keep current weight or default to 300
                                        setTempWeight(tempWeight > 250 && tempWeight <= 500 ? tempWeight : 300);
                                      }
                                    }}
                                    className={`px-3 py-0.5 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                                      (tempWeight !== null && tempWeight !== undefined && tempWeight !== 50 && tempWeight !== 100 && tempWeight !== 250) || (tempWeight === null && weight !== 50 && weight !== 100 && weight !== 250)
                                        ? "border-yogreet-sage bg-yogreet-sage/10 text-yogreet-sage"
                                        : "border-gray-300 hover:border-yogreet-sage/50"
                                    }`}
                                  >
                                    <div className="font-semibold text-xs">Custom</div>
                                    <div className="text-[10px] text-gray-600 leading-tight">Max 500g</div>
                                  </button>
                                </div>

                                {/* Custom Weight Input - show when custom is selected */}
                                {(tempWeight === null ? (weight !== 50 && weight !== 100 && weight !== 250) : (tempWeight !== 50 && tempWeight !== 100 && tempWeight !== 250)) && (
                                  <div className="flex items-center">
                                    <input
                                      type="text"
                                      value={tempWeight !== null && tempWeight !== undefined ? (tempWeight === 0 ? '' : tempWeight.toString()) : weight.toString()}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow only numbers
                                        if (value === '' || /^\d+$/.test(value)) {
                                          if (value === '') {
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
                                        // Allow: backspace, delete, tab, escape, enter, arrows
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
                                              minQuantity,
                                              maxWeight
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
                                      disabled={isLoading}
                                      className="h-9 w-28 px-3 py-1 text-base font-medium border border-stone-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-yogreet-sage focus:border-yogreet-sage disabled:opacity-50 disabled:cursor-not-allowed text-center"
                                      placeholder={`${minQuantity}-${maxWeight} g`}
                                    />
                                    <span className="ml-2 text-base text-stone-600">g</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-base font-medium text-yogreet-charcoal">
                                {weight} g
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                            <div className="flex flex-col gap-0.5">
                              <p className="text-sm text-stone-500">
                                ₹{pricePerKg.toFixed(2)} per kg
                              </p>
                              <p className="text-xs text-stone-400">
                                {(weight / 1000).toFixed(3)} kg × ₹{pricePerKg.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium text-yogreet-charcoal text-lg">
                              ₹{(pricePerKg * (weight / 1000)).toFixed(2)}
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

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200 rounded-xs sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-medium text-yogreet-charcoal mb-6">
                  Sample Summary
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
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Tax</span>
                    <span className="text-yogreet-charcoal">₹0.00</span>
                  </div>
                  <hr className="border-stone-200" />
                  <div className="flex justify-between font-medium text-lg">
                    <span className="text-yogreet-charcoal">Total</span>
                    <span className="text-yogreet-sage">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 mb-6 rounded-xs">
                  <p className="text-sm text-blue-800">
                    Sample requests are subject to approval. You will be notified via email once your request is processed.
                  </p>
                </div>

                <button className="w-full bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-medium mb-4 transition-colors cursor-pointer rounded-xs">
                  Order Samples
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>

                <Link href="/explore">
                  <button className="w-full border border-stone-300 text-stone-700 hover:bg-stone-50 px-6 py-3 font-medium transition-colors cursor-pointer rounded-xs">
                    Request More Samples
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
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
