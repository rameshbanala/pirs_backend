import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import connectMongoDB from "../db/connectMongoDB.js"; // Import the MongoDB connection function

dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);
// Ensure MONGO_URI exists
if (!process.env.MONGO_URI) {
  console.error("❌ Error: MONGO_URI is not defined in .env file.");
  process.exit(1);
}

const departments = [
  "Electricity", "Sanitation", "Roads", "Traffic",
  "Water", "Health", "Fire", "Infrastructure"
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB using the imported function
    await connectMongoDB();

    // Clear existing department users
    const hashedPassword = await bcrypt.hash("123456", 10);

    const users = departments.map(dept => ({
      username: dept.toLowerCase(),
      fullName: `${dept} Department`,
      email: `${dept.toLowerCase()}@gmail.com`,
      password: hashedPassword,
      department: dept,
    }));

    await User.insertMany(users);
    console.log("✅ Department users added successfully!");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  } finally {
    await mongoose.disconnect(); // Ensure MongoDB disconnects properly
    console.log("🔌 MongoDB Disconnected");
  }
};

// Execute the function
seedUsers();
