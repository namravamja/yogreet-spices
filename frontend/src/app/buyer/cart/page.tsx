"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import PageHero from "@/components/shared/PageHero";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "@/services/api/buyerApi";
import { useAuth } from "@/hooks/useAuth";

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
  const { isAuthenticated } = useAuth("buyer");
  const { data: cartData, isLoading: isLoadingCart, refetch } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Transform backend data to match new product schema
  const cartItems = cartData ? cartData.map((item: any) => {
    const product = item.product || {}
    
    // Calculate available stock from package weights
    const sampleWeight = parseFloat(product.sampleWeight || "0")
    const smallWeight = parseFloat(product.smallWeight || "0")
    const mediumWeight = parseFloat(product.mediumWeight || "0")
    const largeWeight = parseFloat(product.largeWeight || "0")
    const availableStock = sampleWeight + smallWeight + mediumWeight + largeWeight
    
    // Get package prices
    const samplePrice = parseFloat(product.samplePrice || "0")
    const smallPrice = parseFloat(product.smallPrice || "0")
    const mediumPrice = parseFloat(product.mediumPrice || "0")
    const largePrice = parseFloat(product.largePrice || "0")
    
    // Calculate price per kg from small package (or sample if small not available)
    let pricePerKg = 0
    if (smallWeight > 0 && smallPrice > 0) {
      pricePerKg = smallPrice / smallWeight
    } else if (sampleWeight > 0 && samplePrice > 0) {
      pricePerKg = samplePrice / sampleWeight
    } else if (mediumWeight > 0 && mediumPrice > 0) {
      pricePerKg = mediumPrice / mediumWeight
    } else if (largeWeight > 0 && largePrice > 0) {
      pricePerKg = largePrice / largeWeight
    }
    
    // Minimum quantity is the smallest package weight
    const minQuantity = Math.min(
      ...([sampleWeight, smallWeight, mediumWeight, largeWeight].filter(w => w > 0))
    ) || 1
    
    return {
      id: item.id,
      productId: item.productId,
      weight: item.quantity, // Backend uses 'quantity', frontend uses 'weight'
      product: {
        id: product.id,
        productName: product.productName,
        productImages: product.productImages || [],
        pricePerKg,
        availableStock,
        minQuantity,
        category: product.category,
        shortDescription: product.shortDescription,
        // Package details
        samplePrice,
        sampleWeight,
        smallPrice,
        smallWeight,
        mediumPrice,
        mediumWeight,
        largePrice,
        largeWeight,
        // Seller information
        seller: {
          id: product.seller?.id || null,
          fullName: product.seller?.fullName || null,
          companyName: product.seller?.companyName || product.seller?.fullName || "Unknown Seller",
          businessLogo: product.seller?.businessLogo || null,
          businessAddress: product.seller?.businessAddress || null,
        },
      },
    }
  }) : [];

  const removeItem = async (cartItemId: string) => {
    try {
      const response = await removeCartItem(cartItemId).unwrap();
      const successMessage = (response as any)?._message || (response as any)?.message || "Item removed from cart successfully";
      toast.success(successMessage);
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Failed to remove item from cart";
      toast.error(errorMessage);
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await clearCart(undefined).unwrap();
      const successMessage = (response as any)?._message || (response as any)?.message || "Cart cleared successfully";
      toast.success(successMessage);
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Failed to clear cart";
      toast.error(errorMessage);
    }
  };

  // Calculate totals safely
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

  const isLoadingData = isLoadingCart || isRemoving || isClearing;

  if (isLoadingData && cartItems.length === 0) {
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
            onClick={handleClearCart}
            disabled={isClearing}
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
              const pricePerKg = item.product?.pricePerKg || 0;
              const seller = item.product?.seller;

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
                          <div className="flex-1">
                            <Link href={`/explore/${item.product?.id || ""}`}>
                              <h3 className="font-medium text-yogreet-charcoal hover:text-yogreet-red hover:underline transition-colors mb-1">
                                {item.product?.productName || "Unknown Product"}
                              </h3>
                            </Link>
                            
                            {/* Seller Information */}
                            {seller && (
                              <Link 
                                href={seller.id ? `/buyer/seller/${seller.id}` : "#"}
                                className="flex items-center gap-2 mb-2 group"
                                onClick={(e) => !seller.id && e.preventDefault()}
                              >
                                {seller.businessLogo ? (
                                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                                    <Image
                                      src={seller.businessLogo}
                                      alt={seller.companyName || seller.fullName}
                                      fill
                                      className="object-cover rounded-full"
                                      sizes="32px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-yogreet-sage shrink-0 flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">
                                      {(seller.companyName || seller.fullName).charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <p className="text-sm font-medium text-yogreet-charcoal group-hover:text-yogreet-red group-hover:underline transition-colors">
                                    {seller.companyName || seller.fullName}
                                  </p>
                                  {seller.businessAddress && (
                                    <p className="text-xs text-stone-500">
                                      {seller.businessAddress.city || ""}{seller.businessAddress.city && seller.businessAddress.country ? ", " : ""}{seller.businessAddress.country || ""}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            )}
                            
                            <span className="inline-block bg-stone-100 text-stone-800 text-xs px-2 py-1 mt-1 rounded-xs">
                              {item.product?.category || "Uncategorized"}
                            </span>
                          </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => removeItem(item.id)}
                                disabled={isRemoving}
                                className="px-3 py-1.5 text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base text-stone-600 font-medium">Weight (kg):</span>
                              <span className="text-base font-medium text-yogreet-charcoal">
                                {weight.toFixed(1)} kg
                              </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                            <div className="flex flex-col gap-0.5">
                              <p className="text-sm text-stone-500">
                                ${pricePerKg.toFixed(2)} per kg
                              </p>
                              <p className="text-xs text-stone-400">
                                {weight.toFixed(1)} kg × ${pricePerKg.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium text-yogreet-charcoal text-lg">
                              ${(pricePerKg * weight).toFixed(2)}
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
