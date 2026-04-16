const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    victimName: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 0
    },
    abuseType: {
      type: String,
      required: true,
      trim: true
    },
    incidentDescription: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    threatLevel: {
      type: String,
      required: true,
      trim: true
    },
    statement: {
      type: String,
      default: "",
      trim: true
    },
    analysis: {
      severity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: null
      },
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      abusePatterns: {
        type: [String],
        default: []
      },
      generatedBrief: {
        type: String,
        default: ""
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);