const mongoose = require("mongoose");

const ScanSchema = new mongoose.Schema({
  target: {
    type: String,
    required: true
  },
  vulnerability: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ["Low","Medium","High"],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Scan", ScanSchema);
