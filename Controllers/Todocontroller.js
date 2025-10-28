const Todo = require("../models/todo");

// List todos
exports.list = async (req, res) => {
   try {
      const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 }).lean(); // ✅ Changed
      return res.status(200).json(todos);
   } catch (e) {
      console.error("todos.list error:", e);
      return res.status(500).json({ error: "Error fetching todos" });
   }
};

// Create todo
exports.create = async (req, res) => {
   try {
      const { title, notes, isCompleted, priority, dueAt, tags } = req.body || {};
      if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

      const todo = await Todo.create({
         userId: req.userId, // ✅ Changed from req.user.id
         title: title.trim(),
         notes: notes?.trim(),
         isCompleted: Boolean(isCompleted),
         priority: priority || "normal",
         dueAt: dueAt ? new Date(dueAt) : undefined,
         tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
      });

      return res.status(201).json(todo);
   } catch (e) {
      console.error("todos.create error:", e);
      return res.status(500).json({ error: "Error creating todo" });
   }
};

// Update todo
exports.update = async (req, res) => {
   try {
      const { id } = req.params;
      const patch = {};
      if (typeof req.body.title === "string") patch.title = req.body.title.trim();
      if (typeof req.body.notes === "string") patch.notes = req.body.notes.trim();
      if (typeof req.body.isCompleted === "boolean") patch.isCompleted = req.body.isCompleted;
      if (typeof req.body.priority === "string") patch.priority = req.body.priority;
      if (req.body.dueAt !== undefined) patch.dueAt = req.body.dueAt ? new Date(req.body.dueAt) : null;
      if (Array.isArray(req.body.tags)) patch.tags = req.body.tags.slice(0, 20);

      if (Object.keys(patch).length === 0) return res.status(400).json({ error: "No valid fields to update" });

      const updated = await Todo.findOneAndUpdate(
         { _id: id, userId: req.userId }, // ✅ Changed from req.user.id
         { $set: patch },
         { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Todo not found" });
      return res.status(200).json(updated);
   } catch (e) {
      console.error("todos.update error:", e);
      return res.status(500).json({ error: "Error updating todo" });
   }
};

// Delete todo
exports.remove = async (req, res) => {
   try {
      const { id } = req.params;
      const deleted = await Todo.findOneAndDelete({ _id: id, userId: req.userId }); // ✅ Changed from req.user.id
      if (!deleted) return res.status(404).json({ error: "Todo not found" });
      return res.status(204).end();
   } catch (e) {
      console.error("todos.remove error:", e);
      return res.status(500).json({ error: "Error deleting todo" });
   }
};
