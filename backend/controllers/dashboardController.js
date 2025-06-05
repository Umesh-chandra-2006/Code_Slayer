const User = require("../models/User");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");

const getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { timePeriod = "30d" } = req.query;

    if (!req.user || req.user.id !== userId) {
      return res
        .status(403)
        .json({ error: "Access denied: Mismatched user ID" });
    }

    const user = await User.findById(userId).select("username email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // --- Date Calculations for Change Metrics (based on timePeriod) ---
    const now = new Date();
    let currentPeriodDays = 30;

    if (timePeriod === "7d") {
      currentPeriodDays = 7;
    } else if (timePeriod === "90d") {
      currentPeriodDays = 90;
    } else if (timePeriod === "all") {
      currentPeriodDays = 99999;
    }

    const currentPeriodEndDate = now;
    const currentPeriodStartDate = new Date(now);
    currentPeriodStartDate.setDate(now.getDate() - currentPeriodDays);

    const previousPeriodEndDate = new Date(currentPeriodStartDate);
    previousPeriodEndDate.setSeconds(previousPeriodEndDate.getSeconds() - 1);
    const previousPeriodStartDate = new Date(previousPeriodEndDate);
    previousPeriodStartDate.setDate(
      previousPeriodEndDate.getDate() - currentPeriodDays
    );

    const oneYearAgo = new Date(now);
    oneYearAgo.setDate(now.getDate() - 365);

    const allUserSubmissions = await Submission.find({
      user: userId,
      submittedAt: {
        $gte: previousPeriodStartDate,
        $lte: currentPeriodEndDate,
      },
    })
      .populate("problem", "title difficulty")
      .sort({ submittedAt: -1 })
      .lean();

    const heatmapSubmissions = await Submission.find({
      user: userId,
      submittedAt: { $gte: oneYearAgo, $lte: now },
    }).lean();

    // --- Process Submissions to calculate metrics ---
    let problemsSolved = 0;
    const solvedProblemIds = new Set();
    const recentSubmissions = [];
    const languageStats = {};
    const dailySubmissionsMap = {};
    const solvedByDifficulty = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };
    const verdictBreakdown = {
      accepted: 0,
      rejected: 0,
      error: 0,
      pending: 0,
      total: 0,
    };

    const solvedInCurrentPeriod = new Set();
    const solvedInPreviousPeriod = new Set();

    const allSubmissionsInCurrentPeriod = [];
    const allSubmissionsInPreviousPeriod = [];

    // Process allUserSubmissions for dashboard metrics
    for (const sub of allUserSubmissions) {
      const submissionDate = new Date(sub.submittedAt);
      const problemId = sub.problem?._id?.toString();

      if (!problemId) {
        console.warn("Skipping submission due to missing problemId:", sub);
        continue;
      }

      const lowerCaseVerdict = sub.verdict ? sub.verdict.toLowerCase() : "";

      // For total unique problems solved (overall for the selected period)
      if (lowerCaseVerdict === "accepted" && !solvedProblemIds.has(problemId)) {
        problemsSolved++;
        solvedProblemIds.add(problemId);

        if (sub.problem?.difficulty) {
          const difficulty = sub.problem.difficulty;
          if (solvedByDifficulty.hasOwnProperty(difficulty)) {
            solvedByDifficulty[difficulty]++;
          }
        }
      }

      if (sub.language) {
        languageStats[sub.language] = (languageStats[sub.language] || 0) + 1;
      }

      // For verdict breakdown
      verdictBreakdown.total++;
      if (verdictBreakdown.hasOwnProperty(lowerCaseVerdict)) {
        verdictBreakdown[lowerCaseVerdict]++;
      }

      // Populate submissions for current/previous periods (for solvedChange and successRateChange)
      if (
        submissionDate >= currentPeriodStartDate &&
        submissionDate <= currentPeriodEndDate
      ) {
        allSubmissionsInCurrentPeriod.push(sub);
        if (lowerCaseVerdict === "accepted") {
          solvedInCurrentPeriod.add(problemId);
        }
      } else if (
        submissionDate >= previousPeriodStartDate &&
        submissionDate < currentPeriodStartDate
      ) {
        allSubmissionsInPreviousPeriod.push(sub);
        if (lowerCaseVerdict === "accepted") {
          solvedInPreviousPeriod.add(problemId);
        }
      }
    }

    // Process heatmapSubmissions for daily counts for the heatmap
    const dailySubmissionCounts = {};
    heatmapSubmissions.forEach((sub) => {
      const submitDate = new Date(sub.submittedAt).toISOString().split("T")[0];
      dailySubmissionCounts[submitDate] =
        (dailySubmissionCounts[submitDate] || 0) + 1;
    });
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    let foundToday = false;

    if (dailySubmissionCounts[today.toISOString().split("T")[0]]) {
      foundToday = true;
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (dailySubmissionCounts[yesterday.toISOString().split("T")[0]]) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 2);
      }
    }

    while (true) {
      const dateString = checkDate.toISOString().split("T")[0];
      if (dailySubmissionCounts[dateString]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      if (checkDate < oneYearAgo) break;
    }

    allUserSubmissions.slice(0, 3).forEach((sub) => {
      recentSubmissions.push({
        id: sub._id,
        problemName: sub.problem ? sub.problem.title : "Unknown Problem",
        status: sub.verdict,
        language: sub.language,
        time: new Date(sub.submittedAt).toLocaleString(),
        difficulty: sub.problem ? sub.problem.difficulty : "Unknown",
      });
    });

    // --- Calculate Solved Change ---
    const currentSolvedCount = solvedInCurrentPeriod.size;
    const previousSolvedCount = solvedInPreviousPeriod.size;

    let solvedChange = "0%";
    if (timePeriod === "all") {
      solvedChange = "N/A"; //
    } else if (previousSolvedCount > 0) {
      const percentageChange =
        ((currentSolvedCount - previousSolvedCount) / previousSolvedCount) *
        100;
      solvedChange = `${
        percentageChange >= 0 ? "+" : ""
      }${percentageChange.toFixed(0)}%`;
    } else if (currentSolvedCount > 0) {
      solvedChange = `+${currentSolvedCount} (New)`;
    }

    // --- Calculate Overall Success Rate ---
    const totalSubmissionsOverall = allUserSubmissions.length;
    const acceptedSubmissionsCountOverall = verdictBreakdown.accepted;

    const successRateOverall =
      totalSubmissionsOverall > 0
        ? (acceptedSubmissionsCountOverall / totalSubmissionsOverall) * 100
        : 0;
    const successRateDisplay = `${successRateOverall.toFixed(0)}%`;

    // --- Calculate Success Rate Change ---
    const calculatePeriodSuccessRate = (submissionsArray) => {
      if (submissionsArray.length === 0) return 0;
      const acceptedCount = submissionsArray.filter(
        (s) => s.verdict && s.verdict.toLowerCase() === "accepted"
      ).length;
      return (acceptedCount / submissionsArray.length) * 100;
    };

    const currentPeriodSuccessRate = calculatePeriodSuccessRate(
      allSubmissionsInCurrentPeriod
    );
    const previousPeriodSuccessRate = calculatePeriodSuccessRate(
      allSubmissionsInPreviousPeriod
    );

    let successRateChange = "0%";
    if (timePeriod === "all") {
      successRateChange = "N/A";
    } else if (previousPeriodSuccessRate > 0) {
      const percentageChange =
        ((currentPeriodSuccessRate - previousPeriodSuccessRate) /
          previousPeriodSuccessRate) *
        100;
      successRateChange = `${
        percentageChange >= 0 ? "+" : ""
      }${percentageChange.toFixed(0)}%`;
    } else if (currentPeriodSuccessRate > 0) {
      successRateChange = `+${currentPeriodSuccessRate.toFixed(0)}% (New)`;
    }

    const currentRank = "Beginner Coder"; // Placeholder for now
    const rankChange = "+0"; // Placeholder for now

    res.status(200).json({
      userName: user.username,
      email: user.email,
      problemsSolved: problemsSolved,
      solvedChange: solvedChange,
      currentRank: currentRank,
      rankChange: rankChange,
      successRate: successRateDisplay,
      successRateChange: successRateChange,
      streak: `${streak} days`,
      recentSubmissions: recentSubmissions,
      upcomingContests: [],
      languageStats: languageStats,
      solvedByDifficulty: solvedByDifficulty,
      dailySubmissionCounts: dailySubmissionCounts,
      verdictBreakdown: verdictBreakdown,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

module.exports = { getDashboardData };
