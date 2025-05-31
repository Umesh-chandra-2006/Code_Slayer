const express = require("express");
const router = express.Router();
const {
  getallproblems,
  getproblembyId,
  createproblem,
  updateproblem,
  deleteproblem,
} = require("../controllers/problemController");

const { isAuthenticated, isAdmin } = require("../middleware/authmiddleware");

router.get("/", getallproblems);
router.get("/:id", getproblembyId);
router.post("/", isAuthenticated, isAdmin, createproblem);
router.put("/:id", isAuthenticated, isAdmin, updateproblem);
router.delete("/:id", isAuthenticated, isAdmin, deleteproblem);

module.exports = router;
