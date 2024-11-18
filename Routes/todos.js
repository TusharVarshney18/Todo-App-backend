const express = require("express");
const Todo = require("../models/todo.js");
const jwt = require("jsonwebtoken");

const router = express.Router();

const secretkey = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware to authenticate user and attach user info to request
const authenticate = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretkey);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Get all todos for the logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id }); // Filter by userId
    return res.status(200).json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return res.status(500).json({ message: "Error fetching todos" });
  }
});

// Post a new todo
router.post("/", authenticate, async (req, res) => {
  const { todo, iscompleted } = req.body;

  if (!todo || todo.trim() === "") {
    return res.status(400).json({ message: "Todo field is required" });
  }

  const newTodo = new Todo({
    todo,
    iscompleted: iscompleted || false,
    userId: req.user.id, // Associate the todo with the logged-in user
  });

  try {
    const savedTodo = await newTodo.save();
    return res.status(201).json(savedTodo);
  } catch (error) {
    console.error("Error saving the todo:", error);
    return res.status(500).json({ message: "Error saving the todo" });
  }
});

// Update a todo by ID
router.put("/:id", authenticate, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.todo = req.body.todo || todo.todo;
    todo.iscompleted =
      req.body.iscompleted !== undefined ? req.body.iscompleted : todo.iscompleted;

    const updatedTodo = await todo.save();
    return res.status(200).json(updatedTodo);
  } catch (error) {
    console.error("Error updating the todo:", error);
    return res.status(500).json({ message: "Error updating the todo" });
  }
});

// Delete a todo by ID
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return res.status(500).json({ message: "Error deleting the todo" });
  }
});

module.exports = router;
