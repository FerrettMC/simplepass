import { useState } from "react";
import { logoutUser, createStudent, createTeacher } from "../backendCalls";
import { useNavigate } from "react-router-dom";
import "./css/AdminHome.css";

export default function AdminHome({ setAuthenticated }) {
  const navigate = useNavigate();
  const [studentEmail, setStudentEmail] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [studentMessage, setStudentMessage] = useState("");

  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherFirstName, setTeacherFirstName] = useState("");
  const [teacherLastName, setTeacherLastName] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");

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
  }

  async function createTeacherF() {
    const res = await createTeacher({
      email: teacherEmail,
      firstName: teacherFirstName,
      lastName: teacherLastName,
      subjects: teacherSubjects,
    });
    setTeacherMessage(res.message);
    console.log(res.teacher.username);
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
          />

          <input
            placeholder="Grade (1–8)"
            type="number"
            value={studentGrade}
            max={8}
            min={0}
            onChange={(e) => setStudentGrade(e.target.value)}
            className="student-input"
          />

          <button className="create-student-btn" onClick={createStudentF}>
            Create Student
          </button>

          {studentMessage && (
            <p className="student-message">{studentMessage}</p>
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
          />

          <input
            placeholder="First Name"
            value={teacherFirstName}
            onChange={(e) => setTeacherFirstName(e.target.value)}
            className="teacher-input"
          />

          <input
            placeholder="Last Name"
            value={teacherLastName}
            onChange={(e) => setTeacherLastName(e.target.value)}
            className="teacher-input"
          />

          <input
            placeholder="Subjects (comma separated)"
            value={teacherSubjects}
            onChange={(e) => setTeacherSubjects(e.target.value)}
            className="teacher-input"
          />

          <button className="create-teacher-btn" onClick={createTeacherF}>
            Create Teacher
          </button>

          {teacherMessage && (
            <p className="student-message">{teacherMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
