const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const todoRoutes = require("./Routes/todos.js");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Helmet for Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://vercel.live"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable if you're using cross-origin resources
  })
);

// Middleware
app.use(express.json()); // Parse incoming JSON
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
app.use(cookieParser()); // Parse cookies

// Routes
app.use("/", require("./Routes/Auth.route.js"));
app.use("/api/todos", todoRoutes);

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
