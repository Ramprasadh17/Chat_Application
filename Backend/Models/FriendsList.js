const mongoose = require("mongoose");

const friendsSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  selectedFriend: [
    {
      name: String,
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("FriendsList", friendsSchema);
