const express = require("express");
const FriendsList = require("../Models/FriendsList");
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

// Controller to add a selected friend to the friend list
router.post("/chat/:senderId", async (req, res) => {
  const { sender, selectedFriend } = req.body;
  console.log(
    "Received request with sender:",
    sender,
    "and selectedFriend:",
    selectedFriend
  );

  try {
    // Find the document with the given sender and update it
    const updatedFriendList = await FriendsList.findOneAndUpdate(
      { sender },
      // Add new selectedFriend to the selectedFriends array using $addToSet to avoid duplicates
      {
        $addToSet: {
          selectedFriend: {
            name: selectedFriend.name,
            recipient: selectedFriend.recipient_Id,
          },
        },
      },
      // Set new: true to return the updated document
      { new: true, upsert: true }
    );

    console.log("Updated friend list:", updatedFriendList);

    res.status(200).json({
      message: `Selected friend added to the list for sender: ${sender}`,
      friendList: updatedFriendList, // Optional: Send back the updated friend list
    });
  } catch (error) {
    console.error("Error adding selected friend:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding selected friend" });
  }
});

// Controller to fetch the friend list for a particular sender
router.get("/chat/:senderId", async (req, res) => {
  const { senderId } = req.params;

  try {
    // Find the document with the given sender
    const friendList = await FriendsList.findOne({ sender: senderId });

    if (friendList) {
      res.status(200).json(friendList.selectedFriend);
      console.log("FriendList :", friendList.selectedFriend);
    } else {
      res.status(404).json({ message: "Friend list not found" });
    }
  } catch (error) {
    console.error("Error retrieving friend list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving friend list" });
  }
});

module.exports = router;
