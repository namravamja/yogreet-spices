/// <reference types="node" />
import { PrismaClient, Seller } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function main() {
  console.log("🌱 Starting seed...");

  // Create sample sellers if they don't exist
  const sellerData = [
    {
      email: "spicemaster@yogreet.com",
      fullName: "Rajesh Kumar",
      companyName: "Spice Master Exports",
      password: await hashPassword("password123"),
      businessType: "Exporter",
      productCategories: ["Turmeric", "Cumin", "Coriander"],
      mobile: "+91 9876543210",
      verificationStatus: "approved",
      isVerified: true,
      isAuthenticated: true,
    },
    {
      email: "organicspices@yogreet.com",
      fullName: "Priya Sharma",
      companyName: "Organic Spices Co",
      password: await hashPassword("password123"),
      businessType: "Manufacturer & Exporter",
      productCategories: ["Chili Powder", "Garam Masala", "Turmeric"],
      mobile: "+91 9876543211",
      verificationStatus: "approved",
      isVerified: true,
      isAuthenticated: true,
    },
    {
      email: "premiumspices@yogreet.com",
      fullName: "Amit Patel",
      companyName: "Premium Spices India",
      password: await hashPassword("password123"),
      businessType: "Exporter",
      productCategories: ["Cardamom", "Cloves", "Fenugreek"],
      mobile: "+91 9876543212",
      verificationStatus: "approved",
      isVerified: true,
      isAuthenticated: true,
    },
  ];

  const createdSellers: Seller[] = [];
  for (const data of sellerData) {
    const seller = await prisma.seller.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });
    createdSellers.push(seller);
    console.log(`✅ Seller created/updated: ${seller.companyName || seller.email}`);
  }

  // Sample spice products
  const products = [
    {
      productName: "Premium Turmeric Powder",
      category: "Spices",
      shortDescription: "Premium quality turmeric powder with high curcumin content. Organic and pure.",
      sellingPrice: "450.00",
      mrp: "550.00",
      availableStock: "500",
      skuCode: "TUR-PREM-001",
      productImages: ["/turmeric-powder-spice.jpg"],
      weight: "1",
      length: "20",
      width: "15",
      height: "10",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[0].id,
    },
    {
      productName: "Organic Cumin Seeds",
      category: "Spices",
      shortDescription: "Premium organic cumin seeds, hand-picked and sun-dried. Rich in flavor and aroma.",
      sellingPrice: "380.00",
      mrp: "450.00",
      availableStock: "300",
      skuCode: "CUM-ORG-001",
      productImages: ["/cumin-seeds-spice.jpg"],
      weight: "1",
      length: "20",
      width: "15",
      height: "10",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[0].id,
    },
    {
      productName: "Coriander Powder",
      category: "Spices",
      shortDescription: "Fine ground coriander powder with fresh aroma. Perfect for Indian and Asian cuisine.",
      sellingPrice: "320.00",
      mrp: "380.00",
      availableStock: "400",
      skuCode: "COR-POW-001",
      productImages: ["/coriander-powder-spice.jpg"],
      weight: "1",
      length: "20",
      width: "15",
      height: "10",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[0].id,
    },
    {
      productName: "Red Chili Powder",
      category: "Spices",
      shortDescription: "Hot and spicy red chili powder. Medium heat level, perfect for daily cooking.",
      sellingPrice: "420.00",
      mrp: "500.00",
      availableStock: "350",
      skuCode: "CHI-RED-001",
      productImages: ["/red-chili-powder-spice.jpg"],
      weight: "1",
      length: "20",
      width: "15",
      height: "10",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[1].id,
    },
    {
      productName: "Garam Masala Powder",
      category: "Spices",
      shortDescription: "Authentic garam masala blend with premium spices. Traditional recipe.",
      sellingPrice: "580.00",
      mrp: "680.00",
      availableStock: "250",
      skuCode: "GAR-MAS-001",
      productImages: ["/placeholder.jpg"],
      weight: "0.5",
      length: "15",
      width: "10",
      height: "8",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[1].id,
    },
    {
      productName: "Cardamom Pods (Green)",
      category: "Spices",
      shortDescription: "Premium green cardamom pods, hand-sorted. Aromatic and flavorful.",
      sellingPrice: "2800.00",
      mrp: "3200.00",
      availableStock: "100",
      skuCode: "CAR-GRN-001",
      productImages: ["/cardamom-pods-spice.jpg"],
      weight: "1",
      length: "20",
      width: "15",
      height: "10",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[2].id,
    },
    {
      productName: "Cloves (Whole)",
      category: "Spices",
      shortDescription: "Premium whole cloves with strong aroma. Perfect for spice blends and cooking.",
      sellingPrice: "650.00",
      mrp: "750.00",
      availableStock: "200",
      skuCode: "CLO-WHO-001",
      productImages: ["/cloves-whole-spice.jpg"],
      weight: "1",
      length: "20",
      width: "15",
      height: "10",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[2].id,
    },
    {
      productName: "Fenugreek Seeds",
      category: "Spices",
      shortDescription: "High quality fenugreek seeds with bitter-sweet taste. Used in Indian cooking.",
      sellingPrice: "280.00",
      mrp: "350.00",
      availableStock: "450",
      skuCode: "FEN-SED-001",
      productImages: ["/fenugreek-seeds-spice.jpg"],
      weight: "1",
      length: "20",
      width: "15",
      height: "10",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[2].id,
    },
    {
      productName: "Asafoetida Powder",
      category: "Spices",
      shortDescription: "Pure asafoetida powder (hing). Strong flavor, used in small quantities.",
      sellingPrice: "1200.00",
      mrp: "1400.00",
      availableStock: "150",
      skuCode: "ASA-POW-001",
      productImages: ["/asafoetida-powder-spice.jpg"],
      weight: "0.1",
      length: "10",
      width: "8",
      height: "5",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[0].id,
    },
    {
      productName: "Black Pepper Whole",
      category: "Spices",
      shortDescription: "Premium whole black pepper. Fresh, aromatic, and pungent.",
      sellingPrice: "680.00",
      mrp: "800.00",
      availableStock: "280",
      skuCode: "PEP-BLK-001",
      productImages: ["/placeholder.jpg"],
      weight: "1",
      length: "20",
      width: "15",
      height: "10",
      shippingCost: "50.00",
      deliveryTimeEstimate: "7-14 days",
      sellerId: createdSellers[1].id,
    },
  ];

  // Create products (skip if already exists based on SKU)
  for (const productData of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { skuCode: productData.skuCode },
    });

    if (!existingProduct) {
      const product = await prisma.product.create({
        data: productData,
      });
      console.log(`✅ Product created: ${product.productName}`);
    } else {
      console.log(`⏭️  Product already exists: ${productData.productName}`);
    }
  }

  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

