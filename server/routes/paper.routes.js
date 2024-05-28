const express = require("express");
const router = express.Router();
const multer = require("multer");
const Paper = require("../models/paper");
const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const path = require("path");
const { ObjectId } = require("mongoose").Types;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.use(
  "/files",
  async (req, res, next) => {
    console.log(req.path);
    await incrementCount(req.path);
    next();
  },
  express.static(path.join(__dirname, "../files"))
);
router.post("/increase-count/:filename", async (req, res) => {
  const { filename } = req.params;

  try {
    const paper = await Paper.findOne({ pdf: filename });

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    paper.count += 1;
    await paper.save();

    res.status(200).json({ message: "Count increased successfully" });
  } catch (error) {
    console.error("Error increasing count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  const { title, description, username, categories, draft, paperType } =
    req.body;

  try {
    const newPaper = new Paper({
      title,
      description,
      // Adjusting the file path to remove "files/" prefix
      pdf: req.file.path.substring(6), // Assuming "files/" is 6 characters long
      uploadedBy: username,
      count: 0,
      citations: 0,
      draft,
      categories: categories ? categories.split(",") : [],
      publicationDate: new Date(),
      paperType,
      bookmarks: 0,
      bookmarkedBy: [],
      averageRating: 0,
    });

    await newPaper.save();
    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

router.post("/add-file", async (req, res) => {
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

router.get("/user-files/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fileIds = user.files.map((fileId) => new ObjectId(fileId));

    const files = await Paper.find(
      { _id: { $in: fileIds } },
      { title: 1, uploadedBy: 1, bookmarkedBy: 1 }
    );

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error retrieving user files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/user-files/:username/:filename", async (req, res) => {
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

router.get("/get-related-papers/:category", async (req, res) => {
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

router.get("/get-papers", async (req, res) => {
  try {
    let query = {};

    if (req.query.sortBy === "viewCount") {
      const papers = await Paper.find({}).sort({ count: -1 });
      console.log(papers.title);
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

router.get("/papers/:username", async (req, res) => {
  try {
    const papers = await Paper.find({ uploadedBy: req.params.username });
    res.json(papers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.put("/papers/:filename", async (req, res) => {
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

router.delete("/papers/:paperId", async (req, res) => {
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

router.get("/search", async (req, res) => {
  console.log("in search");
  let paperQuery = {};
  console.log(req.query);
  const searchData = req.query.search;
  console.log(searchData);

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
    // console.log(paperSearchPromise);

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
    console.log(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error" });
  }
});

router.get("/papers-by-category", async (req, res) => {
  const category = req.query.category;

  try {
    const papers = await Paper.find({ categories: { $in: [category] } });

    res.send(papers);
  } catch (error) {
    console.error("Error fetching papers by category:", error);
    res.status(500).json({ status: "error" });
  }
});
router.get("/get-paper/:id", async (req, res) => {
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
router.post("/increase-citations/:id", async (req, res) => {
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

router.post("/toggle-bookmark", async (req, res) => {
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

router.get("/bookmarked-papers/:username", async (req, res) => {
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

module.exports = router;
