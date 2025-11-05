export interface ProductData {
  id: string;
  // Basic Info
  productName: string;
  category: string;
  shortDescription: string;

  // Pricing & Inventory
  sellingPrice: string;
  mrp: string;
  availableStock: string;
  skuCode: string;

  // Images & Media
  productImages: string[];

  // Shipping Details
  weight: string;
  length: string;
  width: string;
  height: string;
  shippingCost: string;
  deliveryTimeEstimate: string;

  createdAt: string;
  updatedAt: string;
}
