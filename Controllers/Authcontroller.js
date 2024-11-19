const express = require("express");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const { comparePassword, hashpassword } = require("../Middleware/auth.js");
const secretkey = process.env.JWT_SECRET || "your_jwt_secret";

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await hashpassword(password);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secretkey, {
      expiresIn: "1d",
    });

    // Clean up old tokens
    const validTokens = (user.tokens || []).filter((t) => {
      const diff = (Date.now() - parseInt(t.SignedAt)) / 1000;
      return diff < 86400; // Less than 1 day old
    });

    // Save the token
    await User.findByIdAndUpdate(user._id, {
      tokens: [...validTokens, { token, SignedAt: Date.now().toString() }],
    });

    // Send the token in a secure cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure 'Secure' flag for production (HTTPS)
        sameSite: "None", // Allow cross-origin cookie sending
      })
      .json({ message: "Login successful", userId: user._id });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Logout User
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, secretkey);

    await User.findByIdAndUpdate(decoded.id, {
      $pull: { tokens: { token } },
    });

    res.clearCookie("token").json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, secretkey);
    const user = await User.findById(decoded.id).select("-password -tokens");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { registerUser, loginUser, getProfile, logout };
