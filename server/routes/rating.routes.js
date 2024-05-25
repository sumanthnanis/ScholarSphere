const express = require("express");
const router = express.Router();
const Rating = require("../models/rating.model");
const Paper = require("../models/paper");
const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const AuthorRating = require("../models/AuthorRating.model");

router.post("/rate-paper", async (req, res) => {
  const { paperId, username, rating } = req.body;

  try {
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).send({ message: "Paper not found" });
    }

    let existingRating = await Rating.findOne({ paperId, username });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      existingRating = new Rating({ paperId, username, rating });
      await existingRating.save();
    }

    const ratings = await Rating.find({ paperId });
    const totalRatings = ratings.length;
    const sumOfRatings = ratings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );
    const newAverageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

    paper.averageRating = newAverageRating;
    await paper.save();

    res.send({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});
router.get("/get-ratings/:paperId", async (req, res) => {
  try {
    const paperId = req.params.paperId;
    const username = req.query.username;

    const paper = await Paper.findById(paperId);

    if (!paper) {
      return res.status(404).send({ message: "Paper not found" });
    }

    let userRating = null;
    if (username) {
      const rating = await Rating.findOne({ paperId, username });
      userRating = rating ? rating.rating : null;
    }

    res.json({ averageRating: paper.averageRating, userRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
router.post("/rate-author", async (req, res) => {
  const { authorName, username, rating } = req.body;

  try {
    const author = await Profile.findOne({ username: authorName });
    if (!author) {
      return res.status(404).send({ message: "Author not found" });
    }

    let existingRating = await AuthorRating.findOne({ authorName, username });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      existingRating = new AuthorRating({ authorName, username, rating });
      await existingRating.save();
    }

    const ratings = await AuthorRating.find({ authorName });
    const totalRatings = ratings.length;
    const sumOfRatings = ratings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );
    const newAverageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

    author.rating = newAverageRating;
    await author.save();

    res.send({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/get-author-ratings/:authorName", async (req, res) => {
  try {
    const authorName = req.params.authorName;
    const username = req.query.username;

    const author = await Profile.findOne({ username: authorName });

    if (!author) {
      return res.status(404).send({ message: "Author not found" });
    }

    let userRating = null;
    if (username) {
      const rating = await AuthorRating.findOne({ authorName, username });
      userRating = rating ? rating.rating : null;
    }

    const ratings = await AuthorRating.find({ authorName });
    const totalRatings = ratings.length;
    const sumOfRatings = ratings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );
    const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

    res.json({ averageRating, userRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
