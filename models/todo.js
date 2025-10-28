const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 255 },
    notes: { type: String, trim: true, maxlength: 2000 },
    isCompleted: { type: Boolean, default: false, index: true },
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
    dueAt: { type: Date },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false }
);

TodoSchema.index({ userId: 1, isCompleted: 1, createdAt: -1 });

module.exports = mongoose.model("Todo", TodoSchema);
