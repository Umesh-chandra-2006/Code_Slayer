// backend/models/Submission.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  code: { type: String, required: true },
  language: { type: String, required: true },
  verdict: {
    type: String,
    enum: [
      "Pending",
      "Accepted",
      "Wrong Answer",
      "Time Limit Exceeded",
      "Runtime Error",
      "Compilation Error",
      "Error",
    ],
    default: "Pending",
  },
  runtime: { type: Number }, // Overall runtime
  memory: { type: Number }, // Overall memory
  errorMessage: { type: String },

  testResults: [
    {
      input: { type: String },
      expectedOutput: { type: String },
      actualOutput: { type: String },
      status: {
        type: String,
        enum: [
          "Accepted",
          "Wrong Answer",
          "Time Limit Exceeded",
          "Runtime Error",
          "Compilation Error",
          "Error",
        ],
      },
      time: { type: Number },
      memory: { type: Number },
      details: { type: String },
    },
  ],

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Submission", submissionSchema);
