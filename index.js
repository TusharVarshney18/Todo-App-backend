const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const todoRoutes = require("./Routes/todos.js");
const cookieParser = require("cookie-parser");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Built-in JSON parser in Express
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
app.use("/api/todos", todoRoutes);
app.use("/", require("./Routes/Auth.route.js"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database has connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
