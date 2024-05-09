const express = require("express");
const User = require("../Models/User");
const mongoose = require("mongoose");

const router = express.Router();

const MONGODB_URI =
  "mongodb+srv://ramprasadh019:chat_application@cluster0.3rlv5jt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Controller to handle user creation
router.post("/userData", async (req, res) => {
  try {
    const newUser = new User({
      userName: req.body.userName,
      password: req.body.password,
      unique_code: req.body.unique_code,
    });
    await newUser.save();
    console.log("User created:", newUser);
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
});

// Controller to handle user login
router.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await User.findOne({ userName, password });

    if (user) {
      res.status(200).json({
        unique_code: user.unique_code,
        userName: user.userName,
        userId: user._id,
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
});

// Controller to fetch all user data
router.get("/userData", async (req, res) => {
  try {
    const userData = await User.find({});
    res.json({ data: userData });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data" });
  }
});

module.exports = router;
