import { useState } from "react";
import {
  logoutUser,
  createStudent,
  createTeacher,
  addSchoolLocation,
} from "../backendCalls";
import { useNavigate } from "react-router-dom";
import "./css/AdminHome.css";

export default function AdminHome({ setAuthenticated }) {
  const navigate = useNavigate();
  const [studentEmail, setStudentEmail] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [studentMessage, setStudentMessage] = useState("");
  const [studentError, setStudentError] = useState(false);
  const [teacherError, setTeacherError] = useState(false);

  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherFirstName, setTeacherFirstName] = useState("");
  const [teacherLastName, setTeacherLastName] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");
  const [newSchoolLocation, setNewSchoolLocation] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState(false);

  async function handleAddSchoolLocation() {
    if (!newSchoolLocation.trim()) {
      setLocationMessage("Location cannot be empty");
      setLocationError(true);
      return;
    }

    const res = await addSchoolLocation({ location: newSchoolLocation });

    setLocationMessage(`Location added: ${res.location}`);
    setLocationError(false);
    setNewSchoolLocation("");
  }

  async function logout() {
    const res = await logoutUser();
    console.log(res.message);
    setAuthenticated(false);
    navigate("/login");
  }

  async function createStudentF() {
    const res = await createStudent({
      email: studentEmail,
      gradeLevel: studentGrade,
    });
    setStudentMessage(res.message);
    if (res.error) {
      setStudentError(true);
    } else {
      setStudentError(false);
    }
  }

  async function createTeacherF() {
    const res = await createTeacher({
      email: teacherEmail,
      firstName: teacherFirstName,
      lastName: teacherLastName,
      subjects: teacherSubjects,
    });
    setTeacherMessage(res.message);
    if (res.error) {
      setTeacherError(true);
    } else {
      setTeacherError(false);
      console.log(res.data.teacher);
    }
  }

  function handleKeyDownStudent(e) {
    if (e.key === "Enter") {
      createStudentF();
    }
  }

  function handleKeyDownTeacher(e) {
    if (e.key === "Enter") {
      createTeacherF();
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Home Page</h1>
        <button id="logoutButton" onClick={logout}>
          Log out
        </button>
      </div>

      <div className="admin-sections">
        {/* --- Student Card --- */}
        <div className="create-student-box">
          <h2>Add Student</h2>

          <input
            placeholder="Student Email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            className="student-input"
            onKeyDown={handleKeyDownStudent}
          />

          <input
            placeholder="Grade (1–8)"
            type="number"
            value={studentGrade}
            max={8}
            min={0}
            onChange={(e) => setStudentGrade(e.target.value)}
            className="student-input"
            onKeyDown={handleKeyDownStudent}
          />

          <button className="create-student-btn" onClick={createStudentF}>
            Create Student
          </button>

          {studentMessage && (
            <p
              className="student-message"
              style={{
                background: studentError ? "#fdedec" : "#ecfdf5",
                border: studentError
                  ? "1px solid #e76e6e"
                  : "1px solid #6ee7b7",
              }}
            >
              {studentMessage}
            </p>
          )}
        </div>

        {/* --- Teacher Card --- */}
        <div className="create-teacher-box">
          <h2>Add Teacher</h2>

          <input
            placeholder="Teacher Email"
            value={teacherEmail}
            onChange={(e) => setTeacherEmail(e.target.value)}
            className="teacher-input"
            onKeyDown={handleKeyDownTeacher}
          />

          <input
            placeholder="First Name"
            value={teacherFirstName}
            onChange={(e) => setTeacherFirstName(e.target.value)}
            className="teacher-input"
            onKeyDown={handleKeyDownTeacher}
          />

          <input
            placeholder="Last Name"
            value={teacherLastName}
            onChange={(e) => setTeacherLastName(e.target.value)}
            className="teacher-input"
            onKeyDown={handleKeyDownTeacher}
          />

          <input
            placeholder="Subjects (comma separated)"
            value={teacherSubjects}
            onChange={(e) => setTeacherSubjects(e.target.value)}
            className="teacher-input"
            onKeyDown={handleKeyDownTeacher}
          />

          <button className="create-teacher-btn" onClick={createTeacherF}>
            Create Teacher
          </button>

          {teacherMessage && (
            <p
              className="student-message"
              style={{
                background: teacherError ? "#fdedec" : "#ecfdf5",
                border: teacherError
                  ? "1px solid #e76e6e"
                  : "1px solid #6ee7b7",
              }}
            >
              {teacherMessage}
            </p>
          )}
        </div>
        {/* --- School Location Card --- */}
        <div className="add-location-box">
          <h2>Add School Location</h2>

          <input
            placeholder="Location Name"
            value={newSchoolLocation}
            onChange={(e) => setNewSchoolLocation(e.target.value)}
            className="location-input"
            onKeyDown={(e) => e.key === "Enter" && handleAddSchoolLocation()}
          />

          <button
            className="add-location-btn"
            onClick={handleAddSchoolLocation}
          >
            Add Location
          </button>

          {locationMessage && (
            <p
              className="location-message"
              style={{
                background: locationError ? "#fdedec" : "#ecfdf5",
                border: locationError
                  ? "1px solid #e76e6e"
                  : "1px solid #6ee7b7",
              }}
            >
              {locationMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
