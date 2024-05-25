const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  username: { type: String, required: true, unique: true },
  degree: { type: String },
  department: { type: String },
  interests: { type: String },
  institution: { type: String },
  skills: { type: String },
  currentActivity: { type: String },
  profileImage: { type: String },
  rating: { type: Number },
});

module.exports = mongoose.model("Profile", ProfileSchema);
