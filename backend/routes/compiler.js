const express = require("express");
const router = express.Router();
const {
  runCppCode,
  testAgainstAllCases,
} = require("../controllers/compilerController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { compilerLimiter } = require("../middleware/rateLimitMiddleware");

router.post("/run", isAuthenticated, compilerLimiter, runCppCode);
router.post("/test", isAuthenticated, compilerLimiter, testAgainstAllCases);

module.exports = router;
