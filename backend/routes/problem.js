const express = require("express");
const router = express.Router();
const {
  getallproblems,
  getproblembyId,
  createproblem,
  updateproblem,
  deleteproblem,
} = require("../controllers/problemController");

router.get("/", getallproblems);
router.get("/:id", getproblembyId);
router.post("/", createproblem);
router.put("/:id", updateproblem);
router.delete("/:id", deleteproblem);

module.exports = router;
