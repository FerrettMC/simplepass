import { getCurrentUser, loginUser, loginWithGoogle } from "../backendCalls";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./css/Login.css";

export default function Login({ setAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleMessage, setGoogleMessage] = useState("");
  const navigate = useNavigate();
  async function login() {
    const res = await loginUser(email, password);

    console.log(res.message);
    navigateToCorrectPage(res);
  }

  function navigateToCorrectPage(res) {
    if (
      res.message === "Logged in" ||
      res.message === "Logged in with Google"
    ) {
      setAuthenticated(true);
      switch (res.user.role) {
        case "admin":
          navigate("/AdminHome");
          break;
        case "teacher":
          navigate("/TeacherHome");
          break;
        case "student":
          navigate("/StudentHome");
          break;
      }
      getCurrentUser();
    } else {
      setGoogleMessage(res.message);
      return;
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      login();
    }
  }

  return (
    <div id="loginPageDiv">
      <h1 style={{ marginBottom: "15px", fontSize: "35px" }}>SimplePass</h1>

      <h1 style={{ fontSize: "20px" }}>For students and teachers:</h1>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const token = credentialResponse.credential;
          const res = await loginWithGoogle(token);
          navigateToCorrectPage(res);
        }}
        onError={() => console.log("Google Login Failed")}
      />
      {googleMessage && <p style={{ color: "red" }}>Error logging in</p>}
      {!googleMessage && <div style={{ marginBottom: "15px" }}></div>}

      <h2>For admins:</h2>
      <div className="login-form">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button id="loginButton" onClick={login}>
          Login
        </button>
      </div>

      <a href="/register">Looking to add your school?</a>
    </div>
  );
}
