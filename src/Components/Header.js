import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import "./Styles/header.css";
import { useNavigate } from "react-router-dom";
import ProfilePic from "./ProfilePic";

function Header({ username, userId }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };
  const handleUpload = (photo) => {
    setSelectedPhoto(photo);
  };

  return (
    <>
      <div className="navbar">
        <div className="app">Chat Application</div>
        <div className="user">{username}</div>
        <div className="photo" onClick={toggleDropdown}>
          <div className="userpic">
            {selectedPhoto ? (
              <img src={selectedPhoto} alt="Profile" />
            ) : (
              "Profile_Photo"
            )}
          </div>{" "}
          <FontAwesomeIcon icon={faChevronDown} onClick={toggleDropdown} />
          {showDropdown && (
            <div className="settings">
              <a onClick={handleProfileClick}>Profilepic</a>
              <a onClick={handleLogout}>Logout</a>
            </div>
          )}
        </div>
      </div>
      <ProfilePic
        open={showProfileModal}
        handleClose={() => setShowProfileModal(false)}
        handleUpload={handleUpload}
        userId={userId}
      />
    </>
  );
}

export default Header;
