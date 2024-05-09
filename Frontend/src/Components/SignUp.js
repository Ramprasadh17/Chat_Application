import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles/login.css";

function SignUp() {
  const Randomcode = () => {
    let min = 100000000000; // Minimum 12-digit number
    let max = 999999999999; // Maximum 12-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const handleLogin = () => {
    navigate("/");
  };
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    userName: "",
    password: "",
    unique_code: Randomcode(),
  });
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    console.log("hi");

    e.preventDefault();

    axios
      .post("http://localhost:9000/userData", {
        userName: userData.userName,
        password: userData.password,
        unique_code: Randomcode(),
      })
      .then((response) => {
        console.log(response);
        setUserData(userData);
        console.log("User created");
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(userData.userName);
  };
  return (
    <>
      <div className="login_page">
        <div className="app_name">
          <h1 className="welcome">Ramprasadh Chat App</h1>
          <h3 className="app"> SignUp </h3>
        </div>
        <div className="login_container">
          <div className="login_components">
            <div className="username">
              <input
                type="text"
                placeholder="UserName"
                name="userName"
                value={userData.userName}
                onChange={handleChange}
                className="username_input"
              ></input>
            </div>
            <div className="password">
              <input
                type="text"
                placeholder="Password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="password_input"
              ></input>
            </div>
            <div>
              <button
                type="submit"
                onClick={handleSubmit}
                className="submit_button"
              >
                Submit
              </button>
            </div>
            <div>
              <button onClick={handleLogin} className="submit_button">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
