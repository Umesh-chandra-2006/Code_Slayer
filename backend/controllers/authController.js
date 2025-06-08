const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyEmail = require("../utils/verifyEmail");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const pendinguser = {};
const FRONTEND_URL = process.env.FRONTEND_URL;


const code_expiry = 2.5 * 60 * 1000;
const code_cooldown = 60 * 1000;

//For verification email
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

//Registration Process
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const emailverify = await verifyEmail(email);
    if (!emailverify)
      return res
        .status(400)
        .json({ message: "Email does not exist or invalid" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedpass = await bcrypt.hash(password, 8);

    pendinguser[email] = {
      username,
      email,
      password: hashedpass,
      verifycode,
      expiresAt: Date.now() + code_expiry,
      cooldown: Date.now(),
    };

    await transporter.sendMail({
      from: ` "Online Judge" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Email Verification Code",
      text: `Your Email Verification Code is: ${verifycode}`,
    });

    return res
      .status(200)
      .json({ message: "Verification code sent to email succesfully" });
  } catch (err) {
    console.log("Registration Error", err);
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

//Email verification Process
exports.verification = async (req, res) => {
  const { email, code } = req.body;

  try {
    const pending = pendinguser[email];
    if (!pending)
      return res
        .status(400)
        .json({ message: "There is no pending registration for the email" });

    if (Date.now() > pending.expiresAt)
      return res.status(400).json({ message: "Verification code expired" });

    if (pending.verifycode !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    const newUser = new User({
      username: pending.username,
      email: pending.email,
      password: pending.password,
    });
    await newUser.save();

    delete pendinguser[email];

    return res.status(200).json({ message: "User create Successfully" });
  } catch (err) {
    console.error("Verification error:", err);
    return res
      .status(500)
      .json({ message: "Verification failed", error: err.message });
  }
};

//Login Process
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Invalid Credentials" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed:", error: err.message });
  }
};

//Resend Verification Code Process
exports.resendCode = async (req, res) => {
  const { email } = req.body;

  try {
    const pending = pendinguser[email];
    if (!pending)
      return res
        .status(400)
        .json({ message: "No pending registration for this email" });

    if (pending.cooldown && Date.now() - pending.cooldown < code_cooldown) {
      const timeleft = Math.ceil(
        (code_cooldown - (Date.now() - pending.cooldown)) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${timeleft} seconds before requesting a new code.`,
      });
    }

    const newcode = Math.floor(100000 + Math.random() * 900000).toString();
    pending.verifycode = newcode;
    pending.expiresAt = Date.now() + code_expiry;
    pending.cooldown = Date.now();

    await transporter.sendMail({
      from: ` "Online Judge" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Email Verification Code",
      text: `Your Email Verification Code is: ${newcode}`,
    });
    res.status(200).json({ message: "Verification code sent succesfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to resend code", error: err.message });
  }
};

//Forgot Password Process
exports.forgotpassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedtoken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = hashedtoken;
    user.resetPasswordExpire = expiry;
    await user.save();

    const resetURL = `${FRONTEND_URL}/reset-password/${resetToken}`;

     console.log("Constructed resetURL:", resetURL); // Confirm this is correct
    console.log("Attempting to send email with GMAIL_USER:", process.env.GMAIL_USER); // VERIFY THIS!
    console.log("Attempting to send email with GMAIL_PASS length:", process.env.GMAIL_PASS ? process.env.GMAIL_PASS.length : "undefined"); 

    const message = `
      <h3> Password Reset Link <h3>
      <p>Click the link to reset your password:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p> This link will expire in 10 minutes</p>
      `;
    console.log(message);
        console.log("Email HTML message snippet:", message.substring(0, 100) + "..."); // Log a snippet

    try {
        await transporter.sendMail({
            from: `"Online Judge" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Password Reset Link",
            html: message,
        });
        console.log("Email sent successfully to:", email); // Success message
        res.status(200).json({ message: "Password reset email sent" });
    } catch (emailError) {
        console.error("Nodemailer sendMail Error:", emailError); // Specific error log for nodemailer
        // You might want to distinguish between email sending error and other errors
        res.status(500).json({
            message: "Failed to send password reset email. Please try again later.",
            error: emailError.message, // Provide the error message
        });
    }
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({
      message: "Failed to send password reset link",
      error: err.message,
    });
  }
};

//Reset Password Process
exports.resetpassword = async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });

    const hashedPassword = await bcrypt.hash(password, 8);
    user.password = hashedPassword;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Reset failed", error: err.message });
  }
};
