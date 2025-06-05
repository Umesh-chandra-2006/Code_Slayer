const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const problemRoutes = require("./routes/problem");
const submissionRoutes = require("./routes/submission");
const compiler = require("./routes/compiler");
const dashboard = require("./routes/dashboard");
const ai = require("./routes/ai");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/compiler", compiler);
app.use("/api/dashboard", dashboard);
app.use("/api/ai", ai);

app.get("/api/problems/test", (req, res) => {
  res.send("Problem route is working!");
});

app.get("/", (req, res) => {
  res.send("Api is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Test server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
