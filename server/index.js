const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const app = express();
const { ObjectId } = mongoose.Types;

// Import routes
const userRoutes = require("./routes/user.routes");
const profileRoutes = require("./routes/profile.routes");
const paperRoutes = require("./routes/paper.routes");
const ratingRoutes = require("./routes/rating.routes");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/files", express.static(path.join(__dirname, "files")));

// Database connection
require("./config/db")();

// Routes
app.use("/api", userRoutes);
app.use("/api", profileRoutes);
app.use("/api", paperRoutes);
app.use("/api", ratingRoutes);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.listen(8000, () => {
  console.log("server started");
});
