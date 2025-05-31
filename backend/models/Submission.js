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
    enum: ["Pending", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error", "Error"], // Expanded verdicts for clarity
    default: "Pending",
  },
  runtime: { type: Number }, // Overall runtime (e.g., average or max of accepted tests)
  memory: { type: Number }, // Overall memory (e.g., max memory usage across tests)
  errorMessage: { type: String }, // General error message for the submission (e.g., compilation error, server error)

  testResults: [ // Array to store detailed results for each test case
    {
      input: { type: String },
      expectedOutput: { type: String }, // Renamed from 'expected'
      actualOutput: { type: String },   // Renamed from 'actual'
      status: { // Status for this specific test case
        type: String,
        enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error", "Error"],
      },
      time: { type: Number },    // Runtime for this specific test case
      memory: { type: Number },  // Memory for this specific test case (might be null)
      details: { type: String }, // Specific error/details for this test case
    },
  ],

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Submission", submissionSchema);