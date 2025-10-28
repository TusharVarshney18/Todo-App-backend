const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const {
  registerUser,
  loginUser,
  getProfile,
  logout,
} = require("../Controllers/Authcontroller.js");

// Minimal cookie-based guard used only for routes that need it
function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach identity for downstream handlers if needed
    req.auth = { id: decoded.id, email: decoded.email, name: decoded.name };
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Authentication Routes
router.post(
  "/register",
  (req, res, next) => {

    next();
  },
  registerUser
);

router.post("/login", loginUser);

// Protected route: must have valid cookie
router.get("/profile", requireAuth, getProfile);

router.post("/logout", logout);

module.exports = router;
