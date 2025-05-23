const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyEmail = require("../utils/verifyEmail");
const nodemailer = require("nodemailer");
require("dotenv").config();

const pendinguser = {};

const code_expiry = 2.5 * 60 * 1000;
const code_cooldown = 60 * 1000;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

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
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Invalid Credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed:", error: err.message });
  }
};

exports.resendCode = async (req, res) => {
  const { email } = req.body;

  try {
    const pending = pendinguser[email];
    if (!pending)
      return res
        .status(400)
        .json({ message: "No pending registration for this email" });

    if(pending.cooldown && (Date.now() - this.cooldown) < code_cooldown)
    {
      const timeleft = Math.ceil((code_cooldown - (Date.now() - pending.cooldown)) /1000);
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
