const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here"; // Replace for production

// Register route (Allows creating "user" and "admin" accounts)
router.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    role,
    superAdminEmail,
    superAdminPassword,
  } = req.body;

  if (!username || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Username, email, password, and role are required." });
  }

  try {
    if (role === "admin") {
      // Verify super admin credentials
      const superAdmin = await User.findOne({
        email: superAdminEmail,
        role: "superadmin",
      });
      if (
        !superAdmin ||
        !(await superAdmin.comparePassword(superAdminPassword))
      ) {
        return res
          .status(401)
          .json({ error: "Invalid super admin credentials" });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const newUser = new User({
      username,
      email,
      password,
      role: role === "admin" ? "admin" : "user", // Set role based on input
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Middleware for role-based access
const requireRole = (roles) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ error: "Access denied." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error verifying token:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Admin or Superadmin can create new users or admins
router.post(
  "/create",
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (role === "superadmin") {
      return res
        .status(403)
        .json({ error: "Cannot create another superadmin." });
    }

    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: "Email is already registered." });
      }

      const newUser = new User({ username, email, password, role });
      await newUser.save();
      res.status(201).json({ message: "User created successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// Ensure only one superadmin exists
const ensureSuperadmin = async () => {
  try {
    const superadminExists = await User.findOne({ role: "superadmin" });
    if (!superadminExists) {
      const newSuperadmin = new User({
        username: "superadmin",
        email: "superadmin@example.com",
        password: "securepassword", // Replace with env variable in production
        role: "superadmin",
      });
      await newSuperadmin.save();
      console.log("Superadmin initialized successfully.");
    }
  } catch (err) {
    console.error("Error initializing superadmin:", err);
  }
};

ensureSuperadmin();

module.exports = router;
