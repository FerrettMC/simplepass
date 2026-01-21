import {
  logoutUser,
  getCurrentUser,
  getTeacherPasses,
  startPass,
  endPass,
  cancelPass,
  getStudentTeachers,
  getSchool,
  addTeacherAutopassLocation,
  removeTeacherAutopassLocation,
} from "../backendCalls";
import "./css/TeacherHome.css";
import { io } from "socket.io-client";

// IMPORTANT: use your backend LAN IP
const socket = io("http://192.168.1.205:3000", {
  withCredentials: true,
});

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherHome({ setAuthenticated }) {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState("Teacher Home Page");
  const [passes, setPasses] = useState([]);
  const [timers, setTimers] = useState({});
  const [schoolTeachers, setSchoolTeachers] = useState([]);
  const [schoolLocations, setSchoolLocations] = useState([]); // autopass
  const [allSchoolLocations, setAllSchoolLocations] = useState([]); // full list

  const [newLocation, setNewLocation] = useState("");

  async function logout() {
    await logoutUser();
    setAuthenticated(false);
    navigate("/login");
  }

  async function loadPasses() {
    const res = await getTeacherPasses();
    if (res?.passes) {
      setPasses(res.passes);
    }
  }

  useEffect(() => {
    socket.on("passesUpdated", () => {
      console.log("Real-time update received");
      loadPasses(); // refresh your passes instantly
    });

    return () => {
      socket.off("passesUpdated");
    };
  }, []);

  async function handleApprove(passID) {
    await startPass(passID);
    loadPasses();
  }

  async function handleDeny(passID) {
    await cancelPass(passID);
    loadPasses();
  }

  async function handleEnd(passID) {
    await endPass(passID);
    loadPasses();
  }

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setTeacher(currentUser);
      setWelcomeMessage(`Hello, ${currentUser.firstName}!`);
      const currentSchool = await getSchool();
      setAllSchoolLocations(currentSchool.locations);
      setSchoolLocations(currentUser.autoPassLocations || []);
      console.log(currentUser);

      loadPasses();

      // Load teachers for this school
      const teacherRes = await getStudentTeachers();
      if (teacherRes?.teachers) {
        setSchoolTeachers(teacherRes.teachers);
      }
    }

    init();
  }, []);

  // Split passes by status
  const waitingPasses = passes.filter((p) => p.pass.status === "waiting");
  const activePasses = passes.filter((p) => p.pass.status === "active");

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};

      activePasses.forEach((p) => {
        if (!p.pass.start) return;

        const elapsed = Math.floor((Date.now() - p.pass.start) / 1000);
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
        const seconds = String(elapsed % 60).padStart(2, "0");

        newTimers[p.pass.id] = `${minutes}:${seconds}`;
      });

      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [activePasses]);

  function getDestinationName(dest) {
    // Check if destination matches a teacher ID
    const teacher = schoolTeachers.find((t) => t.id === dest);
    if (teacher) return `${teacher.firstName} ${teacher.lastName}`;

    // Otherwise it's a location string
    return dest;
  }

  async function handleAddLocation() {
    if (!newLocation) return alert("Select a location first");

    try {
      const res = await addTeacherAutopassLocation({ location: newLocation });

      if (res?.message === "Location added") {
        setSchoolLocations(res.autoPassLocations);
        setNewLocation("");
      } else {
        alert(res?.message || "Error adding location");
      }
    } catch (err) {
      alert("Failed to add location");
    }
  }

  async function handleDeleteLocation(loc) {
    try {
      const res = await removeTeacherAutopassLocation({ location: loc });

      if (res?.message === "Location removed") {
        setSchoolLocations(res.autoPassLocations);
      } else {
        alert(res?.message || "Error removing location");
      }
    } catch (err) {
      alert("Failed to remove location");
    }
  }

  return (
    <div className="teacher-home">
      <div style={{ display: "flex", gap: "20vw", alignItems: "center" }}>
        <h1>{welcomeMessage}</h1>

        <button id="logoutButton" onClick={logout}>
          Log out
        </button>
      </div>

      <div className="autopass-box">
        <h3>AutoPass Locations</h3>

        {schoolLocations.length === 0 && <p>No AutoPass locations yet.</p>}

        <ul>
          {schoolLocations.map((loc) => (
            <li key={loc} className="location-item">
              {loc}
              <button
                className="delete-btn autopass-boxDelete"
                onClick={() => handleDeleteLocation(loc)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="add-location-row">
          <select
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          >
            <option value="">Select a location</option>
            {allSchoolLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <button onClick={handleAddLocation}>Add</button>
        </div>
      </div>

      {/* WAITING PASSES */}
      <h2>Waiting Passes</h2>

      {waitingPasses.length === 0 && <p>No passes waiting.</p>}

      <div className="pass-section">
        {waitingPasses.map((p) => (
          <div key={p.pass.id} className="pass-card">
            <p>
              <strong>Student:</strong> {p.studentName}
            </p>
            <p>
              <strong>Grade:</strong> {p.gradeLevel}
            </p>
            <p>
              <strong>Destination:</strong>{" "}
              {getDestinationName(p.pass.destination)}
            </p>
            <p>
              <strong>Purpose:</strong> {p.pass.purpose || "None"}
            </p>

            <button onClick={() => handleApprove(p.pass.id)}>Approve</button>
            <button onClick={() => handleDeny(p.pass.id)}>Deny</button>
          </div>
        ))}
      </div>

      {/* ACTIVE PASSES */}
      <h2>Ongoing Passes</h2>

      {activePasses.length === 0 && <p>No active passes.</p>}

      <div className="pass-section">
        {activePasses.map((p) => (
          <div key={p.pass.id} className="pass-card active">
            <p>
              <strong>Student:</strong> {p.studentName}
            </p>
            <p>
              <strong>Grade:</strong> {p.gradeLevel}
            </p>
            <p>
              <strong>Destination:</strong>{" "}
              {getDestinationName(p.pass.destination)}
            </p>
            <p>
              <strong>Purpose:</strong> {p.pass.purpose || "None"}
            </p>
            <p>
              <strong>Time:</strong> {timers[p.pass.id] || "00:00"}
            </p>

            <button onClick={() => handleEnd(p.pass.id)}>End Pass</button>
          </div>
        ))}
      </div>
    </div>
  );
}
