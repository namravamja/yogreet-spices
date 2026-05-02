import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { DeliveryPartner } from "../src/models/DeliveryPartner";
import { hashPassword } from "../src/utils/jwt";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DELIVERY_PARTNER_DATA = {
  name: "Global Export Logistics",
  email: "logistics@yogreet.com",
  password: "DeliveryPartner@2024", // Change this in production!
  phone: "+91-9876543210",
  alternatePhone: "+91-9876543211",
  operatingRegions: [
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Singapore",
    "UAE",
    "Malaysia",
  ],
  serviceType: "multimodal" as const,
  isAuthenticated: true,
};

async function seedDeliveryPartner() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/yogreet-spices";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if delivery partner already exists
    const existingPartner = await DeliveryPartner.findOne({
      email: DELIVERY_PARTNER_DATA.email,
    });

    if (existingPartner) {
      console.log("⚠️  Delivery partner already exists");
      console.log("📧 Email:", existingPartner.email);
      console.log("🏢 Name:", existingPartner.name);
      
      // Ask if user wants to update
      console.log("\n🔄 Updating existing delivery partner...");
      
      // Hash the password
      const hashedPassword = await hashPassword(DELIVERY_PARTNER_DATA.password);
      
      // Update the existing partner
      existingPartner.name = DELIVERY_PARTNER_DATA.name;
      existingPartner.password = hashedPassword;
      existingPartner.phone = DELIVERY_PARTNER_DATA.phone;
      existingPartner.alternatePhone = DELIVERY_PARTNER_DATA.alternatePhone;
      existingPartner.operatingRegions = DELIVERY_PARTNER_DATA.operatingRegions;
      existingPartner.serviceType = DELIVERY_PARTNER_DATA.serviceType;
      existingPartner.isAuthenticated = DELIVERY_PARTNER_DATA.isAuthenticated;
      
      await existingPartner.save();
      console.log("✅ Delivery partner updated successfully");
    } else {
      // Hash the password
      const hashedPassword = await hashPassword(DELIVERY_PARTNER_DATA.password);

      // Create new delivery partner
      const deliveryPartner = new DeliveryPartner({
        ...DELIVERY_PARTNER_DATA,
        password: hashedPassword,
      });

      await deliveryPartner.save();
      console.log("✅ Delivery partner created successfully");
    }

    // Display credentials
    console.log("\n📋 Delivery Partner Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏢 Name:", DELIVERY_PARTNER_DATA.name);
    console.log("📧 Email:", DELIVERY_PARTNER_DATA.email);
    console.log("🔑 Password:", DELIVERY_PARTNER_DATA.password);
    console.log("📱 Phone:", DELIVERY_PARTNER_DATA.phone);
    console.log("🌍 Operating Regions:", DELIVERY_PARTNER_DATA.operatingRegions.join(", "));
    console.log("🚚 Service Type:", DELIVERY_PARTNER_DATA.serviceType);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  IMPORTANT: Change the default password in production!");
    console.log("🔗 Login URL: http://localhost:3000/delivery-partner/login");

    // Close connection
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding delivery partner:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDeliveryPartner();
