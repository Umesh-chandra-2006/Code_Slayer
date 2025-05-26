const express = require("express");
const router = express.Router();
const {
    handleSubmission,
    getAllSubmissions,
    getUserSubmissions,
} = require("../controllers/submissionController");

router.post("/", handleSubmission);
router.get("/", getAllSubmissions);
router.get("/user/:userId", getUserSubmissions);

module.exports = router;
