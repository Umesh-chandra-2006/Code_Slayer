const Problem = require("../models/Problem");
const Tag = require("../models/Tag");

// Helper to normalize tags (capitalize first letter, rest lowercase)
const normalizeTags = (tags) => {
  return tags.map((tag) => {
    if (typeof tag !== "string") return tag;
    return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
  });
};

// Helper function for building the query
const buildProblemQuery = (reqQuery, user) => {
  let query = {};

  const { difficulty, search, tags } = reqQuery;

  if (difficulty) {
    query.difficulty = { $in: difficulty.split(",") };
  }

  if (search) {
    const searchNum = parseInt(search);
    if (!isNaN(searchNum)) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { problemNumber: searchNum },
        { slug: { $regex: search, $options: "i" } },
      ];
    } else {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }
  }

  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim());
    query.tags = { $in: tagArray };
  }

  // --- isPublished / Status field filtering (Admin vs. Public) ---
  if (user && user.role === "admin") {
    if (reqQuery.isPublished !== undefined) {
      query.isPublished = reqQuery.isPublished === "true";
    }
    // If admin does not pass isPublished, no filter is applied, meaning they see all problems
  } else {
    query.isPublished = true;

    query.problemNumber = { $ne: null };
  }

  return query;
};

// Helper function for building the sort options
const buildProblemSort = (reqQuery, user) => {
  const { sortBy, sortOrder } = reqQuery;
  let sortOptions = {
    type: "standard",
    key: "problemNumber",
    order: 1,
  };

  // --- Sorting restrictions for non-admins ---
  let effectiveSortBy = sortBy;
  if (user && user.role !== "admin") {
    if (sortBy === "createdAt" || sortBy === "updatedAt") {
      console.warn(
        `Non-admin user attempted to sort by ${sortBy}. Defaulting to problemNumber.`
      );
      effectiveSortBy = "problemNumber";
    }
  }

  if (effectiveSortBy) {
    sortOptions.order = sortOrder === "desc" ? -1 : 1;

    if (effectiveSortBy === "difficulty") {
      sortOptions.type = "difficulty_custom";
    } else {
      const sortKeyMap = {
        problemNumber: "problemNumber",
        title: "title",
        acceptanceRate: "acceptanceRate",
        createdAt: "createdAt", // Available to admin
        updatedAt: "updatedAt", // Available to admin
      };
      sortOptions.key = sortKeyMap[effectiveSortBy] || "problemNumber";
    }
  }

  return sortOptions;
};

exports.getallproblems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const query = buildProblemQuery(req.query, req.user);
    const sortOptions = buildProblemSort(req.query, req.user);
    const { minAcceptance, maxAcceptance } = req.query;

    const pipeline = [
      { $match: query },
      {
        $addFields: {
          acceptanceRate: {
            $cond: {
              if: { $gt: ["$totalSubmissions", 0] },
              then: {
                $multiply: [
                  { $divide: ["$solvedSubmissions", "$totalSubmissions"] },
                  100,
                ],
              },
              else: 0,
            },
          },
        },
      },
    ];

    if (minAcceptance || maxAcceptance) {
      const acceptanceMatch = {};
      if (minAcceptance) {
        acceptanceMatch.$gte = parseFloat(minAcceptance);
      }
      if (maxAcceptance) {
        acceptanceMatch.$lte = parseFloat(maxAcceptance);
      }
      if (Object.keys(acceptanceMatch).length > 0) {
        pipeline.push({ $match: { acceptanceRate: acceptanceMatch } });
      }
    }

    // --- Custom Difficulty Sorting Logic ---
    if (sortOptions.type === "difficulty_custom") {
      pipeline.push(
        {
          $addFields: {
            difficultyOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$difficulty", "Easy"] }, then: 1 },
                  { case: { $eq: ["$difficulty", "Medium"] }, then: 2 },
                  { case: { $eq: ["$difficulty", "Hard"] }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
        { $sort: { difficultyOrder: sortOptions.order } },
        { $project: { difficultyOrder: 0 } }
      );
    } else {
      // Standard sorting for other fields
      pipeline.push({ $sort: { [sortOptions.key]: sortOptions.order } });
    }

    // Get total count for pagination before applying skip and limit
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await Problem.aggregate(countPipeline);
    const totalProblems = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination and projection stages
    pipeline.push(
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          __v: 0,
          // Exclude actual test case inputs/outputs from list view for security/payload size
          "testCases.input": 0,
          "testCases.output": 0,
          editorial: 0,
          hints: 0,
          starterCode: 0,
        },
      }
    );

    const problems = await Problem.aggregate(pipeline);

    res.status(200).json({
      problems,
      currentPage: page,
      totalPages: Math.ceil(totalProblems / limit),
      totalProblems,
    });
  } catch (err) {
    console.error("Error in getallproblems:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getproblembyId = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // For non-admin users, if the problem is not published, return 404
    if (req.user && req.user.role !== "admin" && !problem.isPublished) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.totalSubmissions > 0) {
      problem.acceptanceRate =
        (problem.solvedSubmissions / problem.totalSubmissions) * 100;
    } else {
      problem.acceptanceRate = 0;
    }

    res.status(200).json(problem);
  } catch (err) {
    console.error("Error in getproblembyId:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch problem", error: err.message });
  }
};

exports.createproblem = async (req, res) => {
  try {
    let {
      title,
      description,
      inputFormat,
      outputFormat,
      sampleTestCases,
      constraints,
      difficulty,
      testCases,
      tags,
      timeLimit,
      memoryLimit,
      editorial,
      hints,
      starterCode,
      isPublished,
    } = req.body;

    tags = tags && tags.length > 0 ? normalizeTags(tags) : [];

    if (!Array.isArray(sampleTestCases)) {
      sampleTestCases = [];
    } else {
      sampleTestCases = sampleTestCases.map((sample) => ({
        input: sample.input || "",
        output: sample.output || "",
        explanation: sample.explanation || "",
      }));
    }

    if (!Array.isArray(hints)) {
      hints = [];
    }

    const processedStarterCode = {};
    if (starterCode && typeof starterCode === "object") {
      if (typeof starterCode.cpp === "string") {
        processedStarterCode.cpp = starterCode.cpp;
      }
    }

    const newProblem = new Problem({
      title,
      description,
      inputFormat,
      outputFormat,
      sampleTestCases,
      constraints,
      difficulty,
      testCases,
      tags,
      timeLimit,
      memoryLimit,
      editorial,
      hints,
      starterCode: processedStarterCode,
      isPublished: typeof isPublished === "boolean" ? isPublished : false,
      createdBy: req.user.id,
    });

    const savedProblem = await newProblem.save();

    // Save new tags if any
    if (tags.length > 0) {
      const existingTags = await Tag.find({ name: { $in: tags } }).select(
        "name"
      );
      const existingTagNames = new Set(existingTags.map((t) => t.name));
      const newTagsToCreate = tags.filter((tag) => !existingTagNames.has(tag));
      if (newTagsToCreate.length > 0) {
        const tagDocuments = newTagsToCreate.map((tag) => ({ name: tag }));
        await Tag.insertMany(tagDocuments, { ordered: false }).catch(
          (insertErr) => {
            console.warn(
              "Some new tags might not have been inserted (likely duplicates):",
              insertErr.message
            );
          }
        );
      }
    }

    res
      .status(201)
      .json({
        message: "Problem created successfully!",
        problem: savedProblem,
      });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: "Validation Error", errors });
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res
        .status(409)
        .json({
          message: `Duplicate value for ${field}: ${value}. Please use a unique ${field}.`,
          errors: { [field]: `Value "${value}" already exists.` },
        });
    }
    console.error("Error creating problem:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateproblem = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      title,
      description,
      inputFormat,
      outputFormat,
      sampleTestCases,
      constraints,
      difficulty,
      testCases,
      tags,
      timeLimit,
      memoryLimit,
      editorial,
      hints,
      starterCode,
      isPublished,
    } = req.body;

    tags = tags && tags.length > 0 ? normalizeTags(tags) : [];

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Authorization: Only the creator or an admin can update the problem
    if (
      problem.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this problem" });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (inputFormat !== undefined) updateFields.inputFormat = inputFormat;
    if (outputFormat !== undefined) updateFields.outputFormat = outputFormat;
    if (constraints !== undefined) updateFields.constraints = constraints;
    if (difficulty !== undefined) updateFields.difficulty = difficulty;
    if (timeLimit !== undefined) updateFields.timeLimit = timeLimit;
    if (memoryLimit !== undefined) updateFields.memoryLimit = memoryLimit;
    if (editorial !== undefined) updateFields.editorial = editorial;
    if (isPublished !== undefined) updateFields.isPublished = isPublished;

    if (sampleTestCases !== undefined) {
      if (!Array.isArray(sampleTestCases)) {
        updateFields.sampleTestCases = [];
      } else {
        updateFields.sampleTestCases = sampleTestCases.map((sample) => ({
          input: sample.input || "",
          output: sample.output || "",
          explanation: sample.explanation || "",
        }));
      }
    }
    if (testCases !== undefined) {
      if (!Array.isArray(testCases)) {
        updateFields.testCases = [];
      } else {
        updateFields.testCases = testCases.map((tc) => ({
          input: tc.input || "",
          output: tc.output || "",
          isPublic: typeof tc.isPublic === "boolean" ? tc.isPublic : false,
        }));
      }
    }
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        updateFields.tags = [];
      } else {
        updateFields.tags = normalizeTags(tags);
      }
    }
    if (hints !== undefined) {
      if (!Array.isArray(hints)) {
        updateFields.hints = [];
      } else {
        updateFields.hints = hints;
      }
    }

    if (starterCode !== undefined) {
      const currentStarterCode = problem.starterCode || {};
      const updatedStarterCode = {};

      if (starterCode && typeof starterCode.cpp === "string") {
        updatedStarterCode.cpp = starterCode.cpp;
      } else {
        updatedStarterCode.cpp = undefined;
      }

      updateFields.starterCode = {
        ...currentStarterCode,
        ...updatedStarterCode,
      };
    }

    const updatedProblem = await Problem.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
      context: "query",
    });

    // If tags were provided in the update, process them
    if (tags && tags.length > 0) {
      const existingTags = await Tag.find({ name: { $in: tags } }).select(
        "name"
      );
      const existingTagNames = new Set(existingTags.map((t) => t.name));
      const newTagsToCreate = tags.filter((tag) => !existingTagNames.has(tag));
      if (newTagsToCreate.length > 0) {
        const tagDocuments = newTagsToCreate.map((tag) => ({ name: tag }));
        await Tag.insertMany(tagDocuments, { ordered: false }).catch(
          (insertErr) => {
            console.warn(
              "Some new tags might not have been inserted (likely duplicates) during update:",
              insertErr.message
            );
          }
        );
      }
    }

    res
      .status(200)
      .json({ message: "Problem updated successfully!", updatedProblem });
  } catch (err) {
    console.error("Error updating problem:", err);
    if (err.name === "ValidationError") {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({
        message: "Problem validation failed",
        errors,
      });
    } else if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      return res
        .status(409)
        .json({
          message: `Duplicate value for ${field}: ${value}. Please use a unique ${field}.`,
          errors: { [field]: `Value "${value}" already exists.` },
        });
    }
    res
      .status(500)
      .json({ message: "Failed to update problem", error: err.message });
  }
};

exports.deleteproblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Authorization: Only the creator or an admin can delete the problem
    if (
      problem.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this problem" });
    }

    await Problem.findByIdAndDelete(id);

    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (err) {
    console.error("Error deleting problem:", err);
    res
      .status(500)
      .json({ message: "Failed to delete problem", error: err.message });
  }
};

exports.getalltags = async (req, res) => {
  try {
    const tags = await Tag.find({}, "name -_id");
    const tagNames = tags.map((tag) => tag.name);
    tagNames.sort((a, b) => a.localeCompare(b));
    res.status(200).json(tagNames);
  } catch (err) {
    console.error("Error fetching tags:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch tags", error: err.message });
  }
};
