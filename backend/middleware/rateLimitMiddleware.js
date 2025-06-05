const rateLimit = require("express-rate-limit");

// General API Limiter: A moderate limit for most public or less sensitive API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Authentication Limiter: A stricter limit for login, register, password reset, etc.
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message:
    "Too many authentication attempts from this IP, please try again after 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Compiler/Submission Limiter: Stricter limit for computationally intensive endpoints
const compilerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message:
    "Too many compilation/submission requests from this IP, please try again after 1 minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

const submissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message:
    "Too many submission attempts from this IP, please try again after 1 minute",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  compilerLimiter,
  submissionLimiter,
};
