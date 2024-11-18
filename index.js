const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const todoRoutes = require("./Routes/todos.js");
const authRoutes = require("./Routes/Auth.route.js");
const cookieParser = require("cookie-parser");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  "https://todo-app-frontend-x8wj.vercel.app", // Deployed frontend
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow requests from allowed origins
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials like cookies
};

// Middleware
app.use(express.json()); // Parse incoming JSON
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
app.use(cookieParser()); // Parse cookies
app.use(cors(corsOptions)); // Apply CORS

// Routes
app.use("/api/todos", todoRoutes);
app.use("/api/auth", authRoutes); // Use a clear prefix for auth routes

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
