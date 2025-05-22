const Problem = require("../models/Problem");

exports.getallproblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json(problems);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch problems", error: err.message });
  }
};

exports.getproblembyId = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem)
      return res.status(404).json({ message: "Problems not found" });
    res.status(200).json(problem);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch problem", error: err.message });
  }
};

exports.createproblem = async (req, res) => {
  try {
    const newProblem = new Problem(req.body);
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    es.status(500).json({ error: "Failed to create problem" });
  }
};

exports.updateproblem = async (req, res) => {
  try {
    const updateproblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updateproblem)
      return res.status(404).json({ message: "Problem not found" });
    res
      .status(200)
      .json({ message: "Problem updated Successfully", updateproblem });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update Problem", error: err.message });
  }
};

exports.deleteproblem = async (req, res) => {
  try {
    const deleteproblem = await Problem.findByIdAndDelete(req.params.id);
    if (!deleteproblem)
      return res.status(404).json({ message: "Problem not found" });
    res.status(200).json({ message: "Problem deleted Successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete Problem", error: err.message });
  }
};
