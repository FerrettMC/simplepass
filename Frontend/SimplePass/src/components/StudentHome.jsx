import {
  logoutUser,
  getStudentTeachers,
  createPass,
  getCurrentUser,
  getSchoolDestinations,
  startPass,
  endPass,
  cancelPass,
} from "../backendCalls";
import "./css/StudentHome.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentHome({ setAuthenticated }) {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [locations, setLocations] = useState([]);

  const [fromTeacher, setFromTeacher] = useState("");
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");

  const [pass, setPass] = useState(null);
  const [timer, setTimer] = useState("00:00");

  const [welcomeMessage, setWelcomeMessage] = useState("Student Home Page");

  // Logout
  async function logout() {
    const res = await logoutUser();
    setAuthenticated(false);
    navigate("/login");
  }

  async function handleEndPass() {
    const res = await endPass();
    if (res.pass) {
      setPass(res.pass);
    }
    alert(res.message);
  }

  async function handleCancelPass() {
    const res = await cancelPass();
    if (res.pass) {
      setPass(res.pass);
    }
    alert(res.message);
  }

  function getCurrentPassTeacher(teacherID) {
    const teacher = teachers.find((t) => t.id === teacherID);
    if (!teacher) return "Unknown";
    return `${teacher.firstName} ${teacher.lastName}`;
  }

  function formatFinalTime(pass) {
    const totalMs = pass.end - pass.start;
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  // Load current user + teachers + locations
  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      setStudent(currentUser);
      setPass(currentUser.pass); // load existing pass if any
      setWelcomeMessage(`Hello, ${currentUser.firstName}!`);

      const teacherRes = await getStudentTeachers();
      setTeachers(teacherRes.teachers);

      const destRes = await getSchoolDestinations();
      setLocations(destRes.destinations);
    }

    loadData();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!pass || pass.status !== "active" || !pass.start) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pass.start) / 1000);
      const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const seconds = String(elapsed % 60).padStart(2, "0");
      setTimer(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [pass]);

  // Poll backend every second for updated pass status
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!pass) return;

      const updatedUser = await getCurrentUser();

      // Only update if pass changed
      if (JSON.stringify(updatedUser.pass) !== JSON.stringify(pass)) {
        setPass(updatedUser.pass);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pass]);

  // Create pass
  async function handleCreatePass() {
    if (!destination || !fromTeacher) {
      alert("Please fill in all required fields");
      return;
    }

    const res = await createPass(destination, fromTeacher, purpose);
    if (res.pass) {
      setPass(res.pass);
    }
  }

  // Start pass (only if autoPass)
  async function handleStartPass() {
    const res = await startPass(pass.id);
    if (res.pass) {
      setPass(res.pass);
    }
  }

  if (!student) return <div>Loading...</div>;

  return (
    <div className="student-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "10px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h1 style={{ marginTop: 30, lineHeight: "1" }}>{welcomeMessage}</h1>

        <button onClick={logout}>Log out</button>
      </div>

      {/* PASS CARD */}
      {pass && (
        <div>
          <div className="pass-card">
            <h3>Hall Pass</h3>

            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-${pass.status}`}>{pass.status}</span>
            </p>

            <p>
              <strong>From:</strong> {getCurrentPassTeacher(pass.fromTeacher)}
            </p>
            <p>
              <strong>To:</strong> {pass.destination}
            </p>
            <p>
              <strong>Purpose:</strong> {pass.purpose || "None"}
            </p>

            {pass.status === "active" && (
              <p>
                <strong>Time:</strong> {timer}
              </p>
            )}

            {pass.status === "ended" && (
              <p>
                <strong>Final Time:</strong> {formatFinalTime(pass)}
              </p>
            )}

            {pass.status === "waiting" && pass.autoPass && (
              <button onClick={handleStartPass}>Start Pass</button>
            )}

            {pass.status === "waiting" && (
              <button className="cancel" onClick={handleCancelPass}>
                Cancel Pass
              </button>
            )}

            {pass.status === "active" && (
              <button className="end" onClick={handleEndPass}>
                End Pass
              </button>
            )}
          </div>
        </div>
      )}

      <h2>Create a Hall Pass</h2>

      {/* FROM TEACHER */}
      <label>From Teacher:</label>
      <select
        value={fromTeacher}
        onChange={(e) => setFromTeacher(e.target.value)}
      >
        <option value="">Select teacher</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.firstName} {t.lastName}
          </option>
        ))}
      </select>

      {/* DESTINATION */}
      <label>Destination:</label>
      <select
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      >
        <option value="">Select destination</option>

        <optgroup label="Teachers">
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </optgroup>

        <optgroup label="Locations">
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </optgroup>
      </select>

      {/* PURPOSE */}
      <label>Purpose (optional):</label>
      <input
        type="text"
        className="purposeInput"
        value={purpose}
        maxLength={50}
        onChange={(e) => setPurpose(e.target.value)}
        placeholder="Bathroom, nurse, meeting, etc."
      />

      <button onClick={handleCreatePass}>Create Pass</button>
    </div>
  );
}
