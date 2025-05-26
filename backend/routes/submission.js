const express = require("express");
const router = express.Router();
const {
    handleSubmission,
    getAllSubmissions,
} = require("../controllers/submissionController");

router.post("/", handleSubmission);
router.get("/", getAllSubmissions);

module.exports = router;
