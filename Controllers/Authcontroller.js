const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { hashPassword, comparePassword } = require("../Middleware/auth.js");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
}


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hash = await hashPassword(password);
    const user = await User.create({ name, email: email.toLowerCase(), hash });

    // ✅ FIX 1: Replace user.signToken() with manual jwt.sign using userId
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    setAuthCookie(res, token);
    return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+hash");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(password, user.hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Already fixed: Uses userId
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    setAuthCookie(res, token);
    return res.json({ message: "Login successful", user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.logout = async (_req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    // ✅ FIX 2: Support both userId and id for backward compatibility
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select("-hash");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
