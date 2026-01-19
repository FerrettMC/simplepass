import {
  logoutUser,
  getCurrentUser,
  getTeacherPasses,
  startPass,
  endPass,
  cancelPass,
  getStudentTeachers,
} from "../backendCalls";
import "./css/TeacherHome.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherHome({ setAuthenticated }) {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState("Teacher Home Page");
  const [passes, setPasses] = useState([]);
  const [timers, setTimers] = useState({});
  const [schoolTeachers, setSchoolTeachers] = useState([]);

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

  return (
    <div className="teacher-home">
      <h1>{welcomeMessage}</h1>

      <button id="logoutButton" onClick={logout}>
        Log out
      </button>

      {/* WAITING PASSES */}
      <h2>Waiting Passes</h2>

      {waitingPasses.length === 0 && <p>No passes waiting.</p>}

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

      {/* ACTIVE PASSES */}
      <h2>Ongoing Passes</h2>

      {activePasses.length === 0 && <p>No active passes.</p>}

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
  );
}
