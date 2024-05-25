const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: req.body.role,
    });
    res.json({
      status: "ok",
      email: user.email,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });

    if (user) {
      const token = jwt.sign(
        {
          email: user.email,
          password: user.password,
        },
        "asdfghjkl1234567890"
      );

      res.json({
        token: token,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } else {
      res.json({ status: "error", user: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error" });
  }
});

module.exports = router;
