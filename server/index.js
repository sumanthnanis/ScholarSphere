const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model.js");
const Paper = require("./models/paper.js");
const Profile = require("./models/profile.model.js");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { profile } = require("console");
const app = express();
const { ObjectId } = mongoose.Types;

app.use(cors());
app.use(express.json());

app.use("/files", express.static(path.join(__dirname, "files")));

mongoose.connect("mongodb://localhost:27017/researchdata", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("db connected");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/register", async (req, res) => {
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

app.post("/api/login", async (req, res) => {
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

app.post("/api/profile", upload.single("profileImage"), async (req, res) => {
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
app.get("/api/profile", async (req, res) => {
  try {
    const profile = await Profile.find({});
    res.json(profile);
  } catch {
    res
      .status(500)
      .json({ error: "Failed to get profile", details: error.message });
  }
});

app.get("/api/profile/:username", async (req, res) => {
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
app.post("/api/add-file", async (req, res) => {
  const { id, username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.files) {
      user.files = [];
    }

    if (!user.files.includes(id)) {
      user.files.push(id);
      await user.save();
      return res
        .status(200)
        .json({ message: "File added to list successfully" });
    } else {
      return res.status(400).json({ message: "File already in list" });
    }
  } catch (error) {
    console.error("Error adding file to list:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/user-files/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fileIds = user.files.map((fileId) => new ObjectId(fileId));

    const files = await Paper.find(
      { _id: { $in: fileIds } },
      { title: 1, uploadedBy: 1, bookmarkedBy: 1 } // Include the bookmarkedBy field
    );

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error retrieving user files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/user-files/:username/:filename", async (req, res) => {
  const { username, filename } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.files = user.files.filter((file) => file !== filename);

    await user.save();

    res.status(200).json({ message: "File removed successfully" });
  } catch (error) {
    console.error("Error removing file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/get-related-papers/:category", async (req, res) => {
  const { category } = req.params;

  const categoriesArray = category.split(",");

  try {
    const relatedPapers = await Paper.find({
      categories: { $in: categoriesArray },
    });

    res.json(relatedPapers);
  } catch (error) {
    console.error("Error fetching related papers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { title, description, username, categories, draft, paperType } =
    req.body;
  const date = Date.now();

  try {
    const paper = await Paper.create({
      title: title,
      description: description,
      pdf: req.file.filename,
      uploadedBy: username,
      count: 0,
      citations: 0,
      draft: draft,
      categories: categories,
      publicationDate: date,
      paperType: paperType,
      bookmark: 0,
      Author: 1,
    });

    res.send({ status: "ok", paper: paper });
  } catch (error) {
    res.send({ status: "error" });
  }
});

app.get("/api/get-papers", async (req, res) => {
  try {
    let query = {};

    if (req.query.sortBy === "viewCount") {
      const papers = await Paper.find({}).sort({ count: -1 });
      return res.send(papers);
    }
    if (req.query.sortBy === "citationCount") {
      const papers = await Paper.find({}).sort({ citations: -1 });
      return res.send(papers);
    }
    if (req.query.category) {
      const formattedCategory = req.query.category
        .replace(/\s+/g, "")
        .toLowerCase();
      const papers = await Paper.find({ categories: formattedCategory });

      return res.send(papers);
    }
    if (req.query.authorName) {
      const authorName = req.query.authorName;

      const papers = await Paper.find({ uploadedBy: authorName });
      return res.send(papers);
    }
    if (req.query.sortBy === "publicationDate") {
      const order = req.query.order === "desc" ? -1 : 1;
      const papers = await Paper.find({}).sort({ publicationDate: order });
      return res.send(papers);
    }

    const papers = await Paper.find({ draft: 0 });
    res.send(papers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ status: "error" });
  }
});

app.get("/api/papers/:username", async (req, res) => {
  try {
    const papers = await Paper.find({ uploadedBy: req.params.username });
    res.json(papers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/api/papers/:filename", async (req, res) => {
  const { filename } = req.params;

  const { draft } = req.body;
  const { bookmarks } = req.body;

  try {
    const paper = await Paper.findOne({ pdf: filename });

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    paper.draft = draft;
    paper.bookmarks = bookmarks;
    await paper.save();

    res
      .status(200)
      .json({ message: "Paper draft status updated successfully" });
  } catch (error) {
    console.error("Error updating paper draft status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/papers/:paperId", async (req, res) => {
  const { paperId } = req.params;
  try {
    const deletedPaper = await Paper.findByIdAndDelete(paperId);

    if (!deletedPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    res.status(200).json({ message: "Paper deleted successfully" });
  } catch (error) {
    console.error("Error deleting paper:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/search", async (req, res) => {
  let paperQuery = {};
  const searchData = req.query.search;

  try {
    if (searchData) {
      paperQuery = {
        $or: [
          { title: { $regex: searchData, $options: "i" } },
          { description: { $regex: searchData, $options: "i" } },
          { uploadedBy: { $regex: searchData, $options: "i" } },
        ],
      };
    }

    const paperSearchPromise = Paper.find(paperQuery);

    const profileSearchPromise = Profile.find({
      username: { $regex: searchData, $options: "i" },
    });

    const [papers, profiles] = await Promise.all([
      paperSearchPromise,
      profileSearchPromise,
    ]);

    let userPapers = [];
    if (profiles.length > 0) {
      const usernames = profiles.map((profile) => profile.username);
      userPapers = await Paper.find({
        uploadedBy: { $in: usernames },
      });
    }

    const allPapers = [...new Set([...papers, ...userPapers])];

    const response = {
      papers: allPapers,
      profiles: profiles,
    };

    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error" });
  }
});

const incrementCount = async (path) => {
  try {
    const decodedPath = decodeURIComponent(path);

    const filename = decodedPath.substring(1);

    let file = await Paper.findOne({ pdf: filename });

    if (file) {
      file.count++;
      await file.save();
    } else {
      console.log("File not found in database");
    }
  } catch (err) {
    console.error("Error incrementing count:", err);
  }
};

app.use(
  "/files",
  async (req, res, next) => {
    console.log(req.path);
    await incrementCount(req.path);
    next();
  },
  express.static(path.join(__dirname, "files"))
);

app.get("/api/papers-by-category", async (req, res) => {
  const category = req.query.category;

  try {
    const papers = await Paper.find({ categories: { $in: [category] } });

    res.send(papers);
  } catch (error) {
    console.error("Error fetching papers by category:", error);
    res.status(500).json({ status: "error" });
  }
});
app.get("/api/get-paper/:id", async (req, res) => {
  const paperId = req.params.id;
  try {
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res
        .status(404)
        .json({ status: "error", message: "Paper not found" });
    }
    res.send(paper);
  } catch (error) {
    console.error("Error fetching paper details:", error);
    res.status(500).json({ status: "error" });
  }
});
app.post("/api/increase-citations/:id", async (req, res) => {
  const paperId = req.params.id;
  try {
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res
        .status(404)
        .json({ status: "error", message: "Paper not found" });
    }
    paper.citations += 1;
    await paper.save();
    res.status(200).json({
      status: "success",
      message: "Citations count increased successfully",
    });
  } catch (error) {
    console.error("Error increasing citations count:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.listen(8000, () => {
  console.log("server started");
});

app.post("/api/toggle-bookmark", async (req, res) => {
  const { paperId, username, bookmarked } = req.body;

  try {
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    if (bookmarked) {
      if (!paper.bookmarkedBy.includes(username)) {
        paper.bookmarkedBy.push(username);
      }
    } else {
      paper.bookmarkedBy = paper.bookmarkedBy.filter(
        (user) => user !== username
      );
    }

    paper.bookmarks = paper.bookmarkedBy.length;

    await paper.save();

    res.status(200).json({ message: "Bookmark status updated", paper });
  } catch (error) {
    console.error("Error updating bookmark status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/bookmarked-papers/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const papers = await Paper.find({ bookmarkedBy: username });

    if (!papers || papers.length === 0) {
      return res.status(404).json({ message: "No bookmarked papers found" });
    }

    res.status(200).json(papers);
  } catch (error) {
    console.error("Error fetching bookmarked papers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/rate", async (req, res) => {
  const { author, rating } = req.body;

  try {
    // Find the profile by username and update the rating
    const profile = await Profile.findOneAndUpdate(
      { username: author },
      { rating: rating },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to get ratings
app.get("/api/ratings", async (req, res) => {
  try {
    // Fetch all profiles and their ratings
    const profiles = await Profile.find({}, "username rating");

    // Construct an object with username as key and rating as value
    const ratings = {};
    profiles.forEach((profile) => {
      ratings[profile.username] = profile.rating;
    });

    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
