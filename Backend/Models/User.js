const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
  unique_code: String,
});

module.exports = mongoose.model("User", userSchema);
