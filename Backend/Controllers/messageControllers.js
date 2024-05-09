const express = require("express");
const Message = require("../Models/Message");
const mongoose = require("mongoose");

const router = express.Router();

const MONGODB_URI =
  "mongodb+srv://ramprasadh019:chat_application@cluster0.3rlv5jt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Controller to handle sending messages
router.post("/chat/:senderId/:recipientId", async (req, res) => {
  const { msg, datetime } = req.body;
  const { senderId, recipientId } = req.params;

  try {
    // Save message from sender to recipient
    await saveMessage(senderId, recipientId, msg, datetime);

    // Save message from recipient to sender
    await saveMessage(recipientId, senderId, msg, datetime);

    res.status(201).json({ message: "Messages saved successfully" });
  } catch (error) {
    console.error("Error saving messages:", error);
    res
      .status(500)
      .json({ error: "An error occurred while saving the messages" });
  }
});

// Controller to fetch all messages between two users
router.get("/chat/:senderId/:recipientId", async (req, res) => {
  const { senderId, recipientId } = req.params;

  try {
    let allMessages = [];

    // Find messages from sender to recipient
    const senderRecipientMessages = await Message.findOne({
      sender: senderId,
      "messages.recipient": recipientId,
    });

    if (senderRecipientMessages) {
      const msgArray = senderRecipientMessages.messages.map(
        (message) => message.msg
      );
      allMessages = allMessages.concat(msgArray);
    }

    // Find messages from recipient to sender
    const recipientSenderMessages = await Message.findOne({
      sender: recipientId,
      "messages.recipient": senderId,
    });

    if (recipientSenderMessages) {
      const msgArray = recipientSenderMessages.messages.map(
        (message) => message.msg
      );
      allMessages = allMessages.concat(msgArray);
    }

    if (allMessages.length === 0) {
      return res.status(404).json({ error: "No messages found" });
    }

    // Sort the messages by timestamp
    allMessages.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    // Return the messages
    res.status(200).json({ messages: allMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages" });
  }
});

// Function to save a message
async function saveMessage(senderId, recipientId, msg, datetime) {
  let result;

  // Check if there is an existing message between sender and recipient
  const existingMessage = await Message.findOne({
    sender: senderId,
    "messages.recipient": recipientId,
  });

  if (existingMessage) {
    // Update existing message by pushing the new msg
    result = await Message.findOneAndUpdate(
      { sender: senderId, "messages.recipient": recipientId },
      { $push: { "messages.$.msg": { datetime: datetime, msg: msg } } },
      { new: true }
    );
  } else {
    // Create new message document
    result = await Message.findOneAndUpdate(
      { sender: senderId },
      {
        $push: {
          messages: {
            recipient: recipientId,
            msg: [{ datetime: datetime, msg: msg }],
          },
        },
      },
      { upsert: true, new: true }
    );
  }

  console.log(`Message saved - Sender: ${senderId}, Recipient: ${recipientId}`);
}

module.exports = router;
