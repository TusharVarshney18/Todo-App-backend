const express = require("express");
const cors = require("cors");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  logout,
} = require("../Controllers/Authcontroller.js");

// CORS Configuration for this Router
router.use(
  cors({
    credentials: true,
    origin: "https://todo-app-frontend-x8wj.vercel.app",
  })
);

// Authentication Routes
router.post("/register", (req, res, next) => {
  console.log("Register endpoint hit with body:", req.body); // Debugging log
  next();
}, registerUser);

router.post("/login", loginUser);
router.get("/profile", getProfile); // Protected route
router.post("/logout", logout);

module.exports = router;
