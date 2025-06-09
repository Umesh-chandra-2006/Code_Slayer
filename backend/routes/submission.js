const express = require("express");
const router = express.Router();
const {
  apiLimiter,
  submissionLimiter,
} = require("../middleware/rateLimitMiddleware");
const {
  handleSubmission,
  getAllSubmissions,
  getUserSubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");

router.post("/", isAuthenticated, submissionLimiter, handleSubmission);
router.get("/", isAuthenticated, isAdmin, apiLimiter, getAllSubmissions);
router.get("/:id", isAuthenticated, apiLimiter, getSubmissionById);
router.get("/user/:userId", isAuthenticated, apiLimiter, getUserSubmissions);

module.exports = router;
