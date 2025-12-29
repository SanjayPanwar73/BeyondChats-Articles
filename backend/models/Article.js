const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: String,
  originalContent: String,
  updatedContent: String,
  references: [String],
  sourceUrl: String,
  isUpdated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Article", articleSchema);
