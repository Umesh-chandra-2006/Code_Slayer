// backend/controllers/dashboardController.js
const User = require('../models/User');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

const getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied: Mismatched user ID" });
    }

    const user = await User.findById(userId).select('username email');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const submissions = await Submission.find({ user: userId })
      .populate('problem', 'title difficulty')
      .sort({ submittedAt: -1 })
      .limit(100);

    let problemsSolved = 0;
    const solvedProblemIds = new Set();
    const recentSubmissions = [];
    const languageStats = {};
    const dailySubmissions = {};

    submissions.forEach(sub => {
      if (sub.verdict === 'accepted' && sub.problem && !solvedProblemIds.has(sub.problem._id.toString())) {
        problemsSolved++;
        solvedProblemIds.add(sub.problem._id.toString());
      }

      if (recentSubmissions.length < 3 && sub.problem) { // Ensure problem exists
         recentSubmissions.push({
           id: sub._id,
           problemName: sub.problem.title,
           status: sub.verdict,
           language: sub.language,
           time: new Date(sub.submittedAt).toLocaleString(), // Format as needed
           difficulty: sub.problem.difficulty
         });
      }

      languageStats[sub.language] = (languageStats[sub.language] || 0) + 1;

      const submitDate = new Date(sub.submittedAt).toISOString().split('T')[0];
      if (!dailySubmissions[submitDate]) {
        dailySubmissions[submitDate] = true;
      }
    });

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const dateString = currentDate.toISOString().split('T')[0];
        if (dailySubmissions[dateString]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (i === 0 && !dailySubmissions[dateString]) { // If no submission today, streak is 0
            streak = 0;
            break;
        } else { // Gap in streak
            break;
        }
    }

    const successRate = submissions.length > 0
        ? `${((submissions.filter(s => s.verdict === 'accepted').length / submissions.length) * 100).toFixed(0)}%`
        : '0%';

    const currentRank = 'Beginner Coder'; // Placeholder

    res.status(200).json({
      userName: user.username,
      problemsSolved: problemsSolved,
      solvedChange: '+0', // Needs real calculation
      currentRank: currentRank,
      rankChange: '+0', // Needs real calculation
      successRate: successRate,
      successRateChange: '+0%', // Needs real calculation
      streak: `${streak} days`,
      recentSubmissions: recentSubmissions,
      upcomingContests: [],
      languageStats: languageStats,
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

module.exports = { getDashboardData }; // <-- THIS LINE IS CRUCIAL FOR THE EXPORT