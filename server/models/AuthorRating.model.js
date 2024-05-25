const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorRatingSchema = new Schema(
    {
      authorName: {
        type: String,
        required: true,
      },
      username: {
        type: String,
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
  const AuthorRating = mongoose.model("AuthorRating", AuthorRatingSchema);

  module.exports = AuthorRating;