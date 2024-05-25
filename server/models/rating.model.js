const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RatingSchema = new Schema(
  {
    paperId: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
    },
    username: {
      type: String,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Rating = mongoose.model("Rating", RatingSchema);

module.exports = Rating;
