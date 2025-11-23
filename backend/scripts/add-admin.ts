import dotenv from "dotenv";
import { connectDB, disconnectDB } from "../src/config/db";
import { Admin } from "../src/models/Admin";
import { hashPassword } from "../src/utils/jwt";

// Load environment variables
dotenv.config();

const addAdmin = async () => {
  try {
    // Connect to database
    console.log("Connecting to database...");
    await connectDB();

    const username = "yadmin";
    const password = "1111";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log(`❌ Admin with username "${username}" already exists!`);
      await disconnectDB();
      process.exit(1);
    }

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);

    // Create admin user
    console.log("Creating admin user...");
    const admin = await Admin.create({
      username,
      password: hashedPassword,
    });

    console.log(`✅ Admin created successfully!`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   ID: ${admin._id}`);
    
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    await disconnectDB();
    process.exit(1);
  }
};

// Run the script
addAdmin();

