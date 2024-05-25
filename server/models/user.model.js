const mongoose = require("mongoose");
const User = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    files: { type: [String], default: [] },
  },
  { collection: "user-data" }
);

const model = mongoose.model("User", User);
module.exports = model;
