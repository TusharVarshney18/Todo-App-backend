const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  logout,
} = require("../Controllers/Authcontroller.js");

// Authentication Routes
router.post("/register", (req, res, next) => {
  console.log("Register endpoint hit with body:", req.body); // Debugging log
  next();
}, registerUser);

router.post("/login", loginUser);
router.get("/profile", getProfile); // Protected route
router.post("/logout", logout);

module.exports = router;
