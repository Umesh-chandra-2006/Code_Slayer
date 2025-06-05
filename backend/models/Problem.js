const mongoose = require("mongoose");
const slugify = require("slugify");

const sampleTestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    //required: true,
  },
  output: {
    type: String,
    //required: true,
  },
  explanation: {
    type: String,
    // Explanation is optional, so no 'required: true'
  },
});

// Original testCaseSchema for judging
const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    //required: true, // not strictly required
  },
  output: {
    type: String,
    //required: true, //  not strictly required
  },
  isPublic: {
    type: Boolean,
    required: true,
  },
});

const problemSchema = new mongoose.Schema(
  {
    problemNumber: {
      type: Number,
      unique: true,
      index: true,
      // Default to 0, but pre-save hook will assign 1 for first problem or increment
      default: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
      index: true,
    },
    // New: slug for friendly URLs
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2500,
    },
    inputFormat: { type: String, trim: true },
    outputFormat: { type: String, trim: true },
    constraints: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
      index: true,
    },
    timeLimit: {
      type: Number, // In milliseconds
      default: 1000,
      min: 100,
    },
    memoryLimit: {
      type: Number, // In megabytes (MB)
      default: 256,
      min: 1,
    },
    //Multiple sample test cases with explanations
    sampleTestCases: {
      type: [sampleTestCaseSchema],
      default: [],
    },
    // Test cases for judging remain the same
    testCases: {
      type: [testCaseSchema],
      validate: {
        validator: function (testCases) {
          const publicCount = testCases.filter((tc) => tc.isPublic).length;
          const privateCount = testCases.filter((tc) => !tc.isPublic).length;
          return publicCount >= 2 && privateCount >= 2;
        },
        message: "There must be at least 2 public and 2 private test cases.",
      },
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    editorial: {
      type: String,
      // Can be optional, will be displayed in its own tab
    },
    hints: {
      type: [String],
      default: [],
    },
    // Acceptance Rate
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    solvedSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    starterCode: {
      cpp: { type: String },
      python: { type: String },
      java: { type: String },
      javascript: { type: String },
      // And other languages like java: { type: String }, javascript: { type: String } etc. as needed
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook for problemNumber and slug generation
problemSchema.pre("save", async function (next) {
  if (
    this.isNew &&
    (this.problemNumber === undefined || this.problemNumber === 0)
  ) {
    try {
      const lastProblem = await this.constructor.findOne(
        {},
        {},
        { sort: { problemNumber: -1 } }
      );
      this.problemNumber =
        lastProblem && typeof lastProblem.problemNumber === "number"
          ? lastProblem.problemNumber + 1
          : 1;
    } catch (error) {
      return next(error);
    }
  }

  // --- slug generation logic ---
  if (this.isModified("title") || (this.isNew && this.title)) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  next();
});

module.exports = mongoose.model("Problem", problemSchema);
