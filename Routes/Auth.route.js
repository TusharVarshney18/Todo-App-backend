const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  logout,
} = require("../Controllers/Authcontroller.js");

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getProfile); // Protected route (implement auth middleware if required)
router.post("/logout", logout);

module.exports = router;
