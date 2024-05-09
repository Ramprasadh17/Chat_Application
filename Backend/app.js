const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userController = require("./Controllers/usersControllers");
const friendsController = require("./Controllers/friendsControllers");
const messageController = require("./Controllers/messageControllers");

const app = express();
const PORT = 9000; // Define the port here

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Define routes
app.use("/", userController);
app.use("/chat/:senderId", friendsController);
app.use("/chat/:senderId/:recipientId", messageController);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
