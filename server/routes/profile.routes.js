const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Paper = require("../models/paper");
const Profile = require("../models/profile.model");
const User = require("../models/user.model");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/profile", upload.single("profileImage"), async (req, res) => {
  const {
    username,
    degree,
    department,
    interests,
    institution,
    skills,
    currentActivity,
  } = req.body;

  const profileImage = req.file ? `/files/${req.file.filename}` : null;

  try {
    let profile = await Profile.findOne({ username });

    if (profile) {
      profile.degree = degree;
      profile.department = department;
      profile.interests = interests;
      profile.institution = institution;
      profile.skills = skills;
      profile.currentActivity = currentActivity;
      if (profileImage) {
        profile.profileImage = profileImage;
      }
      await profile.save();
      res.json({ message: "Profile updated successfully" });
    } else {
      profile = new Profile({
        username,
        degree,
        department,
        interests,
        institution,
        skills,
        currentActivity,
        profileImage,
      });
      await profile.save();
      res.status(201).json({ message: "Profile created successfully" });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to create/update profile",
      details: error.message,
    });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const profile = await Profile.find({});
    res.json(profile);
  } catch {
    res
      .status(500)
      .json({ error: "Failed to get profile", details: error.message });
  }
});

router.get("/profile/:username", async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    const user = await User.findOne({ username: req.params.username });

    if (profile && user) {
      res.json({ ...profile._doc, email: user.email, role: user.role });
    } else {
      res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
