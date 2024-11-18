const express = require("express");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const { comparePassword, hashpassword } = require("../Middleware/auth.js");

const secretkey = process.env.JWT_SECRET || "your_jwt_secret";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hashpassword(password);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Log in a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }

    // Check if password matches
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      secretkey,
      { expiresIn: "1d" }
    );

    // Manage tokens
    let oldtokens = user.tokens || [];
    if (oldtokens.length) {
      oldtokens = oldtokens.filter((t) => {
        const timediff = (Date.now() - parseInt(t.SignedAt)) / 1000;
        return timediff < 86400; // Keep tokens less than 1 day old
      });
    }

    // Update user tokens
    await User.findByIdAndUpdate(user._id, {
      tokens: [...oldtokens, { token, SignedAt: Date.now().toString() }],
    });

    // Set token in cookie
    res
      .cookie("token", token, { httpOnly: true })
      .json({ token, userId: user._id });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (token) {
      const user = jwt.verify(token, secretkey);

      // Remove token from database
      await User.findByIdAndUpdate(user.id, {
        $pull: { tokens: { token } },
      });
    }

    res.clearCookie("token"); // Remove token cookie
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: error.message });
  }
};


const getProfile = async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, secretkey, {}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  } else {
    res.json(null);
  }
};

module.exports = { registerUser, loginUser, getProfile, logout };
