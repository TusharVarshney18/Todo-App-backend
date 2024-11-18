const mongoose = require("mongoose");

// Todo Schema
const TodoSchema = mongoose.Schema({
  todo: {
    type: String,
    required: true,
  },
  iscompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: { // Link todo to a specific user
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Todo", TodoSchema);
