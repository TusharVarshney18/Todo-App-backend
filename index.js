const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow your Next.js app and local dev with credentials
const allowedOrigins = [
  "https://todo-app-frontend-sable.vercel.app",
  "http://localhost:5173",
  "http://localhost:3001",
  "http://localhost:3000"

];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Preflight for all routes
app.options("*", cors());

// Basic security headers (lightweight)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Body + cookies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});
app.use("/login", authLimiter);
app.use("/register", authLimiter);

// ✅ NEW: Root route (Welcome message)
app.get("/", (req, res) => {
  res.json({
    message: "Todo App API - Backend Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: {
        register: "POST /register",
        login: "POST /login",
        logout: "POST /logout",
        profile: "GET /profile"
      },
      todos: {
        list: "GET /api/todos",
        create: "POST /api/todos",
        update: "PATCH /api/todos/:id",
        delete: "DELETE /api/todos/:id"
      },
      utility: {
        health: "GET /health"
      }
    },
  });
});

// Routes
app.use("/", require("./Routes/Auth.route.js"));
app.use("/api/todos", require("./Routes/todos.js"));

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Something went wrong!" });
});

// DB + start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  });

// ✅ Export for Vercel serverless
module.exports = app;
