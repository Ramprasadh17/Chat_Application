import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    userName: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:9000/login", loginData)
      .then((response) => {
        console.log(response);
        const { userId, unique_code, userName } = response.data;
        console.log(
          "Successfully logged in with userId:",
          userId,
          unique_code,
          userName
        );
        navigate(`/chat/${userName}`, {
          state: { userId, unique_code, userName },
        });
      })
      .catch((err) => {
        console.error(err);
        alert("UserName or Password is Incorrect");
        setLoginData({ userName: "", password: "" });
      });
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <>
      <div className="login_page">
        <div className="app_name">
          <h5 className="welcome">Welcome!</h5>
          <h1 className="app">Ramprasadh Chat App</h1>
        </div>
        <div className="login_container">
          <div className="login_components">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="username">
                <input
                  type="text"
                  placeholder="UserName"
                  name="userName"
                  value={loginData.userName}
                  onChange={handleChange}
                  className="username_input"
                />
              </div>
              <div className="password">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  className="password_input"
                />
              </div>
              <div>
                <button type="submit" className="submit_button">
                  Submit
                </button>
              </div>
            </form>
            <div className="signup_tab">
              New User?{" "}
              <span className="signup_button" onClick={handleSignup}>
                SignUp
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
