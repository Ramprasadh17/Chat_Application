const express = require("express");
const app = express();
const http = require("http").createServer(app);
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const { type } = require("@testing-library/user-event/dist/type");
const PORT = 9000; // Define the port here
const MONGODB_URI =
  "mongodb+srv://ramprasadh019:chat_application@cluster0.3rlv5jt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// Set up CORS headers for Socket.IO requests
const server = http; // Create a server instance using Express app
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log(17, socket);

  console.log("New client connected");

  socket.on("message", (data) => {
    console.log("Received message from client:", data);
    io.emit("message", data);
    // Broadcasting the received message to all clients except the sender
    socket.broadcast.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

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

const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
  unique_code: String,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.post("/userData", async (req, res) => {
  try {
    const newUser = new User({
      userName: req.body.userName,
      password: req.body.password,
      unique_code: req.body.unique_code,
    });
    await newUser.save();
    console.log("User created:", newUser);
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await User.findOne({ userName, password });

    if (user) {
      res.status(200).json({
        unique_code: user.unique_code,
        userName: user.userName,
        userId: user._id,
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
});

app.get("/userData", async (req, res) => {
  try {
    const userData = await User.find({});
    res.json({ data: userData });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data" });
  }
});

//ProfilePic
// Create a Mongoose schema and model for storing file paths
const uploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    image: String,
  },
  { collection: "ImageDetails" }
);

const Images = mongoose.model("ImageDetails", uploadSchema);
// Get the upload directory path
const uploadDir = path.join(__dirname, "uploads");

// Create the upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for handling multipart/form-data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Destination:", uploadDir);
    return cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}_${file.originalname}`;
    console.log("Filename:", fileName);
    return cb(null, fileName);
  },
});
const upload = multer({
  storage: storage,
}).single("image");

// Handle POST request to upload endpoint
app.post("/:userId/upload", (req, res) => {
  // Call the upload middleware to handle the file upload
  upload(req, res, async (err) => {
    console.log(25, storage);
    if (err) {
      // Handle any errors that occurred during file upload
      console.error(err);
      return res.status(500).send(err.message);
    }
    // File uploaded successfully
    console.log("image", req.file); // This will contain information about the uploaded file

    // Save information about the uploaded file to the database
    try {
      const existingImage = await Images.findOne({ userId: req.params.userId });

      // If an existing image is found, update its filename
      if (existingImage) {
        existingImage.image = req.file.filename;
        await existingImage.save();
        console.log("File information updated in the database");
      } else {
        // If no existing image is found, create a new image record
        const newImage = new Images({
          userId: req.params.userId,
          image: req.file.filename,
        });
        await newImage.save();
        console.log("New file information saved to the database");
      }
    } catch (error) {
      console.error("Error saving file information to database:", error);
      return res.status(500).send("Error saving file information to database");
    }

    res.status(200).send("File uploaded successfully");
  });
});

// Assuming Express app is already defined and multer is configured

// Define a route to serve uploaded files
app.get("/:userId/uploads", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all image records for the user in the database
    const images = await Images.find({ userId });

    // Construct an array of image file names
    const fileNames = images.map((image) => image.image);

    // Send the array of file names to the client
    res.json(fileNames);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).send("Internal Server Error");
  }
});

//friend_list_adding//

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

const FriendsList = mongoose.model("FriendsList", friendsSchema);

app.post("/chat/:senderId", async (req, res) => {
  const { sender, selectedFriend } = req.body;
  console.log(
    "Received request with sender:",
    sender,
    "and selectedFriend:",
    selectedFriend
  );

  try {
    // Find the document with the given unique_code and update it
    const updatedFriendList = await FriendsList.findOneAndUpdate(
      { sender },
      // Add newSelectedFriend to the selectedFriends array using $addToSet to avoid duplicates
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
      message: `Selected friend added to the list for unique_code: ${sender}`,
      friendList: updatedFriendList, // Optional: Send back the updated friend list
    });
  } catch (error) {
    console.error("Error adding selected friend:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding selected friend" });
  }
});

app.get("/chat/:senderId", async (req, res) => {
  const { senderId } = req.params;

  try {
    // Find the document with the given unique_code
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

//message //
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
const Message = mongoose.model("Message", messageSchema);

// Backend code for handling POST request to send messages
app.post("/chat/:senderId/:recipientId", async (req, res) => {
  const { msg, datetime } = req.body;
  const { senderId, recipientId } = req.params;

  try {
    // Save message from sender to recipient
    await saveMessage(senderId, recipientId, msg, datetime);

    // Save message from recipient to sender
    // await saveMessage(recipientId, senderId, msg, datetime);

    res.status(201).json({ message: "Messages saved successfully" });
  } catch (error) {
    console.error("Error saving messages:", error);
    res
      .status(500)
      .json({ error: "An error occurred while saving the messages" });
  }
});

async function saveMessage(senderId, recipientId, msg, datetime) {
  let result;

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
  console.log(result);
}

app.get("/chat/:senderId/:recipientId", async (req, res) => {
  const { senderId, recipientId } = req.params;

  console.log(125, senderId, recipientId);
  let messages = [];
  let usermessages = [];
  let friendmessages = [];

  try {
    const senderMessages = await Message.findOne({
      sender: senderId,
    });
    const recepientMessages = await Message.findOne({
      sender: recipientId,
    });

    console.log("beforefilteredsenderMessages :", senderMessages);
    console.log("beforefilteredrecepientMessages :", recepientMessages);

    if (senderMessages && !recepientMessages) {
      const filteredsenderMessages = senderMessages.messages
        ? senderMessages.messages.filter(
            (message) => message.recipient == recipientId
          )
        : [];

      if (filteredsenderMessages.length > 0) {
        console.log("filteredsenderMessages: ", filteredsenderMessages);
        usermessages = filteredsenderMessages[0].msg;
        res.status(200).json({ usermessages });
        console.log(281, usermessages);
      } else {
        console.log("filteredsenderMessages is empty");
        res.status(200).json({ usermessages: [] });
      }
    }
    if (!senderMessages && recepientMessages) {
      const filteredrecepientMessages = recepientMessages.messages.filter(
        (message) => message.recipient == senderId
      );
      console.log("filteredrecepientMessages : ", filteredrecepientMessages);
      friendmessages = filteredrecepientMessages[0].msg;
      res.status(200).json({ friendmessages });
      console.log(282, friendmessages);
    }
    if (senderMessages && recepientMessages) {
      const filteredsenderMessages = senderMessages.messages.filter(
        (message) => message.recipient == recipientId
      );
      console.log("filteredsenderMessages : ", filteredsenderMessages);
      const filteredrecepientMessages = recepientMessages.messages.filter(
        (message) => message.recipient == senderId
      );
      console.log("filteredrecepientMessages : ", filteredrecepientMessages);
      usermessages = filteredsenderMessages[0].msg;
      friendmessages = filteredrecepientMessages[0].msg;

      // const allMessages = messages.sort(
      //   (a, b) => new Date(a.datetime) - new Date(b.datetime)
      // );
      res.status(200).json({ usermessages, friendmessages });
      console.log(283, usermessages, friendmessages);
    }

    if (!senderMessages && !recepientMessages) {
      return res.status(404).json({ error: "No messages found" });
    }

    // Sort the messages by timestamp
    // allMessages.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
