const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaperSchema = new mongoose.Schema(
  {
    pdf: String,
    title: String,
    description: String,
    uploadedBy: String,
    count: Number,
    citations: Number,
    draft: Number,
    categories: [String],
    citedby: [String],
    publicationDate: Date,
    paperType: String,
    bookmarks: { type: Number, default: 0 },
    bookmarkedBy: { type: [String], default: [] },
    Author: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }, // Add averageRating field
  },
  { collection: "paperDetails" }
);

const Paper = mongoose.model("Paper", PaperSchema);

module.exports = Paper;
