const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  messages: [
    {
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
      },
      msg: [
        {
          datetime: { type: Date },
          msg: { type: String },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Message", messageSchema);
