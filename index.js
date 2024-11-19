const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const todoRoutes = require("./Routes/todos.js");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// // Configure Helmet for Security
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "https://vercel.live"],
//       },
//     },
//     crossOriginEmbedderPolicy: false, // Adjust for cross-origin resources
//   })
// );

app.use(cors());


// Middleware
app.use(express.json()); // Parse incoming JSON
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
app.use(cookieParser()); // Parse cookies

// Routes
app.use("/", require("./Routes/Auth.route.js")); // Authentication routes (unchanged)
app.use("/api/todos", todoRoutes); // Todo routes

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected to MongoDB"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit process if database connection fails
  });

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

// Error Handling for Unmatched Routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});