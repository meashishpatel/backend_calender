const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User"); // Adjust path as necessary
require("dotenv").config(); // Load environment variables from .env file

// MongoDB connection URI from .env file
const DB_URI = process.env.MONGO_URI; // Using the DB_URI from the .env file

(async () => {
  try {
    // Check if DB_URI is set in the environment variables
    if (!DB_URI) {
      console.error("MongoDB URI not provided in .env file");
      return process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(DB_URI, {});
    console.log("Connected to MongoDB");

    // Check if a super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      console.log("Super admin already exists. No changes made.");
      return process.exit(0);
    }

    // Create a new super admin
    const hashedPassword = await bcrypt.hash("superadmin_password", 10); // Replace with your desired password
    const superAdmin = new User({
      username: "superadmin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "superadmin",
    });

    await superAdmin.save();
    console.log("Super admin created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error creating super admin:", err.message);
    process.exit(1);
  }
})();
