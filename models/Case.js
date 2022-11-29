const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: ["Mild", "Moderate", "Severe"],
      default: "Moderate",
    },
    temperature: Number,
  },
  { timestamps: true }
);

const Case = mongoose.model("Case", CaseSchema);

module.exports = Case;
