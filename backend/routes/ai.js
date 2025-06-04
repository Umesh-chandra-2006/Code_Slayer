const express = require("express");
const { aiCodeReview } = require("../controllers/aiController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { apiLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/review", isAuthenticated, apiLimiter, aiCodeReview);

module.exports = router;
