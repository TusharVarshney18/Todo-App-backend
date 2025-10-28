const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/requireAuth");
const todos = require("../Controllers/TodoController");

router.use(requireAuth);
router.get("/", todos.list);
router.post("/", todos.create);
router.put("/:id", todos.update);
router.delete("/:id", todos.remove);

module.exports = router;
