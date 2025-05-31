const express = require("express");
const router = express.Router();
const {
  handleSubmission,
  getAllSubmissions,
  getUserSubmissions,
} = require("../controllers/submissionController");
const { isAuthenticated, isAdmin } = require("../middleware/authmiddleware");


router.post("/",isAuthenticated, handleSubmission);
router.get("/",isAuthenticated, isAdmin, getAllSubmissions);
router.get("/user/:userId", isAuthenticated, getUserSubmissions);

module.exports = router;
