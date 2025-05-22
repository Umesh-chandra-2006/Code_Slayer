const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

router.post('/', async (req,res) =>{
    try {
        const newsubmission =new Submission(req.body);
        const saved = await newsubmission.save();

        res.status(201).json(saved);
    } catch(err) {
        res.status(500).json({error: "Submission Failed"});
    }
});

router.get('/', async (req,res) =>{
    try {
        const submissions =new Submissions.find().populate('user','username').populate('problem','title');
        res.json(submissions);
    } catch(err) {
        res.status(500).json({error: "Error fetching Submissions"});
    }
});

module.exports = router;