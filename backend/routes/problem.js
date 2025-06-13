const express = require("express");
const router = express.Router();
const { apiLimiter } = require("../middleware/rateLimitMiddleware");
const {
  getallproblems,
  getproblembySlug,
  createproblem,
  updateproblem,
  deleteproblem,
  getalltags,
} = require("../controllers/problemController");

const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");

router.get("/", isAuthenticated, apiLimiter, getallproblems);
router.get("/tags", isAuthenticated, apiLimiter, getalltags);
router.get("/:slug", isAuthenticated, apiLimiter, getproblembySlug);
router.post("/", isAuthenticated, isAdmin, apiLimiter, createproblem);
router.put("/:slug", isAuthenticated, isAdmin, apiLimiter, updateproblem);
router.delete("/:slug", isAuthenticated, isAdmin, apiLimiter, deleteproblem);

module.exports = router;
