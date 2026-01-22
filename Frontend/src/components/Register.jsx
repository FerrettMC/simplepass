import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerSchool } from "../backendCalls";
import "./css/Register.css";

export default function Register({ setAuthenticated }) {
  const navigate = useNavigate();

  const [schoolName, setSchoolName] = useState("");
  const [schoolDomain, setSchoolDomain] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation rules
  const domainValid = /^@?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(schoolDomain);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail);
  const passwordStrong = password.length >= 8;
  const allFilled =
    schoolName &&
    domainValid &&
    adminFirstName &&
    adminLastName &&
    username &&
    emailValid &&
    passwordStrong &&
    inviteCode;
  function goBack() {
    navigate("/login");
  }
  async function register() {
    if (!allFilled) return;

    const school = {
      name: schoolName,
      domain: schoolDomain,
      adminName: adminFirstName,
      adminLastName: adminLastName,
      username,
      adminEmail,
      password,
      inviteCode,
    };

    const data = await registerSchool(school);
    if (data && data.loggedIn) {
      setAuthenticated(true);
      navigate("/AdminHome");
    }
  }

  return (
    <>
      <button className="goBack" onClick={goBack}>
        Go back
      </button>
      <div
        id="register-div"
        className="register-container"
        style={{ marginLeft: "-25px", marginTop: "30px" }}
      >
        <h1>Register School</h1>

        <h2>School Information</h2>

        <input
          placeholder="School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="register-item"
        />

        <input
          placeholder="School Email Domain (e.g. @neenahschools.org)"
          value={schoolDomain}
          onChange={(e) => setSchoolDomain(e.target.value)}
          className={`register-item ${
            schoolDomain && !domainValid ? "invalid" : ""
          }`}
        />
        {schoolDomain && !domainValid && (
          <p className="error">
            Domain must look like @school.org or school.org
          </p>
        )}

        <h2>Admin Information</h2>

        <input
          placeholder="First Name"
          value={adminFirstName}
          onChange={(e) => setAdminFirstName(e.target.value)}
          className="register-item"
        />

        <input
          placeholder="Last Name"
          value={adminLastName}
          onChange={(e) => setAdminLastName(e.target.value)}
          className="register-item"
        />

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="register-item"
        />

        <input
          placeholder="Admin Email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          className={`register-item ${
            adminEmail && !emailValid ? "invalid" : ""
          }`}
        />
        {adminEmail && !emailValid && (
          <p className="error">Enter a valid email address</p>
        )}

        <div className="password-wrapper">
          <input
            placeholder="Password (min 8 characters)"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`register-item ${
              password && !passwordStrong ? "invalid" : ""
            }`}
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10z"
                />
                <line
                  x1="4"
                  y1="4"
                  x2="20"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10z"
                />
              </svg>
            )}
          </span>
        </div>

        {password && !passwordStrong && (
          <p className="error">Password must be at least 8 characters</p>
        )}

        <h2>Security</h2>

        <input
          placeholder="Invite Code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="register-item"
        />

        <button
          id="register-button"
          onClick={register}
          disabled={!allFilled}
          className={!allFilled ? "disabled" : ""}
        >
          Create School & Admin Account
        </button>
      </div>
    </>
  );
}
