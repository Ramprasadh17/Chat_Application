import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import "./Styles/chat.css";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
// import io from "socket.io-client";

function Chat() {
  const location = useLocation();
  console.log("Location state:", location.state);
  const { userId, userName } = location.state;
  console.log(userName);
  const senderId = userId;
  console.log(senderId);

  const chatContainerRef = useRef(null);

  const [friendName, setFriendName] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState([]);
  const [connectedFriend, setConnectedFriend] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [usersfriends, setUsersfriends] = useState([]);

  const friendsUserId = friendName.map((user) => user.recipient_Id);
  console.log(friendsUserId);
  console.log(friendName);

  useEffect(() => {
    const friendslist = async () => {
      try {
        const response = await axios.get("http://localhost:9000/userData");
        console.log(response.data.data);
        const list = response.data.data;
        const users_list = list.map((user) => ({
          recipient_Id: user._id,
          userName: user.userName,
        }));
        console.log(users_list);
        setFriendName(users_list);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    friendslist();
  }, []); // Fetch friends list only once when component mounts

  const handleChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    // Filter friend names based on search term
    const filteredSuggestions = friendName
      .filter((user) =>
        user.userName.toLowerCase().startsWith(value.toLowerCase())
      )
      .map((user) => ({
        userName: user.userName,
        recipient_Id: user.recipient_Id,
      }));
    setSuggestions(filteredSuggestions);
    console.log(filteredSuggestions);
    console.log(suggestions);
  };

  const handleSelect = (userName, recipient_Id) => {
    console.log(recipient_Id);
    const isAlreadySelected = selectedFriend.some(
      (friend) => friend.name === userName
    );

    if (!isAlreadySelected) {
      const newSelectedFriend = { name: userName, recipient_Id: recipient_Id };
      const updatedfriendlist = [...selectedFriend, newSelectedFriend];
      setSelectedFriend(updatedfriendlist);
      sendRequest(newSelectedFriend);
      // Send request immediately
      setSearchTerm("");
      console.log(selectedFriend);
    } else {
      setSearchTerm("");
      console.log("Username already selected");
      console.log(selectedFriend);
    }
  };

  const connecting = (friend) => {
    setConnectedFriend(friend);
    setRecipientId(friend._id);
    console.log(friend);
    setTimeout(() => {
      scroll();
    }, 300);
    fetchMessages();
  };
  console.log(connectedFriend);

  useEffect(() => {
    toast.success(`LogIn Successful, \nWelcome ${userName}!`, {
      position: "top-center",
      style: {
        background: "#fff",
      },
      autoClose: 3000,
    });
  }, [userName]);

  const [message, setMessage] = useState({ msg: "" });
  const [usersentmsg, setUsersentmsg] = useState([]);
  const [friendsentmsg, setFriendsentmsg] = useState([]);
  const [sentmsg, setSentmsg] = useState([]);

  const handleMessageChange = (e) => {
    setMessage({
      ...message,
      [e.target.name]: e.target.value,
    });
  };

  const fetchMessages = async () => {
    console.log(senderId);
    console.log(recipientId);
    try {
      const response = await axios.get(
        `http://localhost:9000/chat/${senderId}/${recipientId}`
      );
      console.log(response);
      if (response.data.usermessages && response.data.friendmessages) {
        const sortedMessages = [
          ...response.data.usermessages,
          ...response.data.friendmessages,
        ].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        setSentmsg(sortedMessages);
        setUsersentmsg(response.data.usermessages);
        setFriendsentmsg(response.data.friendmessages);
      } else if (response.data.usermessages) {
        setSentmsg(
          response.data.usermessages.sort(
            (a, b) => new Date(a.datetime) - new Date(b.datetime)
          )
        );
        setUsersentmsg(response.data.usermessages);
      } else if (response.data.friendmessages) {
        setSentmsg(
          response.data.friendmessages.sort(
            (a, b) => new Date(a.datetime) - new Date(b.datetime)
          )
        );
        setFriendsentmsg(response.data.friendmessages);
      } else {
        console.log("No messages yet.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendRequest = (selectedFriendArray) => {
    console.log(selectedFriendArray);
    axios
      .post(`http://localhost:9000/chat/${senderId}`, {
        sender: senderId,
        selectedFriend: selectedFriendArray,
      })
      .then((response) => {
        console.log(response.data);
        // alert(`Connected with ${selectedFriendArray}`);
        usersfriendlist();
      })
      .catch((error) => {
        console.error(error);
        // alert("An error occurred while connecting.");
      });
  };

  const usersfriendlist = () => {
    axios
      .get(`http://localhost:9000/chat/${senderId}`)
      .then((response) => {
        console.log("Friend list:", response.data);
        console.log("Friend list:", response);
        setUsersfriends(response.data);
      })
      .catch((error) => {
        console.error("Error fetching friend list:", error);
      });
  };

  console.log("FriendList:", usersfriends);

  const sendMessage = () => {
    const date = new Date();
    date.setUTCHours(date.getUTCHours() + 5);
    date.setUTCMinutes(date.getUTCMinutes() + 30);

    const datetime = date.toISOString();
    console.log(datetime);

    console.log(recipientId);
    console.log(senderId);
    console.log(datetime);
    axios
      .post(`http://localhost:9000/chat/${senderId}/${recipientId}`, {
        recipient: recipientId,
        sender: senderId,
        msg: message.msg,
        datetime: datetime,
      })
      .then((response) => {
        console.log(response);
        // alert("Message sent successfully!");
        console.log(`recipientId: ${recipientId}`);
        // socket.emit("message", { msg: message.msg });
        setMessage({ msg: "" });
        fetchMessages();
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while sending the message.");
      });
  };

  const scroll = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    fetchMessages();
    usersfriendlist();
  }, [senderId, recipientId, selectedFriend, connectedFriend]);
  console.log("sentmsg", sentmsg);
  console.log(usersentmsg);
  console.log(friendsentmsg);

  return (
    <>
      <div className="chat">
        <Header username={userName} userId={userId} />
        <ToastContainer />
        <div className="chat_box">
          <div className="chat_list">
            <div className="chats_heading">Chats</div>
            <div className="search">
              <input
                type="search"
                value={searchTerm}
                onChange={handleChange}
                placeholder="Search friend's name"
                className="search_box"
              />
              <div className="suggestions">
                {searchTerm !== "" && (
                  <ul>
                    {suggestions.map((user) => (
                      <li
                        key={user.recipient_Id}
                        onClick={() =>
                          handleSelect(user.userName, user.recipient_Id)
                        }
                      >
                        {user.userName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="friendlist">
              {usersfriends.map((friend) => (
                <div
                  key={friend.recipient}
                  onClick={() =>
                    connecting({
                      name: friend.name,
                      _id: friend.recipient,
                    })
                  }
                  className="friend"
                >
                  <div className="friendName">{friend.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chat_field">
            <div className="contact_name">
              {connectedFriend ? (
                <h4>{connectedFriend.name}</h4>
              ) : (
                <h4>Let's chat</h4>
              )}
            </div>
            <div className="chat_ui_container" ref={chatContainerRef}>
              {connectedFriend ? (
                sentmsg.length === 0 ? (
                  <h1 className="message_note">Start a new conversation</h1>
                ) : (
                  sentmsg.map((messages, _id) => (
                    <div
                      key={_id}
                      className={
                        usersentmsg.find((elem) => elem._id === messages._id)
                          ? "usermsg"
                          : "friendmsg"
                      }
                      style={{
                        display: "block", // Ensures each message is displayed on a new line
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: usersentmsg.find(
                            (elem) => elem._id === messages._id
                          )
                            ? "red"
                            : "blue",
                          borderRadius: usersentmsg.find(
                            (elem) => elem._id === messages._id
                          )
                            ? "20px 0 20px 20px"
                            : "0 20px 20px 20px",
                          padding: "5px 10px", // Adjust padding as needed
                        }}
                      >
                        {messages.msg}
                      </span>
                    </div>
                  ))
                )
              ) : (
                <h1 className="message_note">
                  Start chatting by selecting a friend
                </h1>
              )}
            </div>
            <div className="msg_box">
              <span className="msg_input">
                <input
                  type="textarea"
                  placeholder="write your message"
                  name="msg"
                  value={message.msg}
                  onChange={handleMessageChange}
                />
              </span>
              <span
                className="send_button"
                onClick={() => {
                  sendMessage();
                  setTimeout(() => {
                    scroll();
                  }, 500);
                }}
              >
                <FontAwesomeIcon icon={faCircleArrowRight} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
