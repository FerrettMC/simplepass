import { useState } from "react";
import {
  logoutUser,
  createStudent,
  createTeacher,
  addSchoolLocation,
  getSchool,
  getStudents,
  deleteStudent,
  changeMaxPasses,
} from "../backendCalls";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./css/AdminHome.css";

export default function AdminHome({ setAuthenticated }) {
  const navigate = useNavigate();
  const [studentEmail, setStudentEmail] = useState("");
  const [school, setSchool] = useState("");
  const [showLocationsPopup, setShowLocationsPopup] = useState(false);
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
  const [students, setStudents] = useState([]);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [maxDailyPasses, setMaxDailyPasses] = useState(0);
  const [settingsMessage, setSettingsMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const userSchool = await getSchool();
      setSchool(userSchool);
      setMaxDailyPasses(userSchool.maxPassesDaily);

      const res = await getStudents();
      if (!res.error) {
        setStudents(res.students);
      }
    }

    loadData();
  }, [showLocationsPopup]);

  async function handleAddSchoolLocation() {
    if (!newSchoolLocation.trim()) {
      setLocationMessage("Location cannot be empty");
      setLocationError(true);
      return;
    }

    const res = await addSchoolLocation({ location: newSchoolLocation });

    if (res.error) {
      setLocationError(true);
      setLocationMessage(res.message.location);
    } else {
      setLocationMessage(res.message);
      setLocationError(false);
    }
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

      // ⭐ Add the new student to the list immediately
      if (res.data?.student) {
        setStudents((prev) => [...prev, res.data.student]);
      }

      // Clear inputs
      setStudentEmail("");
      setStudentGrade("");
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
      setTeacherEmail("");
      setTeacherFirstName("");
      setTeacherLastName("");
      setTeacherSubjects("");
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

  async function handleDeleteStudent(id) {
    const res = await deleteStudent({ id });
    console.log(res.message);

    setStudents((prev) => prev.filter((s) => s.id !== id));
  }
  async function changeSchoolMaxPasses(passes) {
    const res = await changeMaxPasses({ passes });

    console.log(res.message);
    setSettingsMessage(res.message);
    if (!res.error) {
      setMaxDailyPasses(passes);
    }
  }

  const filteredStudents =
    gradeFilter === "all"
      ? students
      : students.filter((s) => s.gradeLevel === gradeFilter);

  const searchedStudents = filteredStudents.filter(
    (s) =>
      (s.firstName?.toLowerCase() || "").includes(searchQuery) ||
      (s.lastName?.toLowerCase() || "").includes(searchQuery) ||
      (s.email?.toLowerCase() || "").includes(searchQuery),
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Home Page</h1>
          <div
            className="settings-bar"
            onClick={() => setShowSettings(!showSettings)}
            style={{ cursor: "pointer", marginTop: "5px" }}
          >
            <p>⚙️ Settings</p>
          </div>
        </div>

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
            placeholder="Grade (1–12)"
            type="number"
            value={studentGrade}
            max={12}
            min={1}
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

          <button
            className="add-location-btn"
            style={{
              transform: "scale(0.9)",
              marginTop: "0px",
              width: "60%",
              display: "block",
              margin: "0 auto",
            }}
            onClick={() => setShowLocationsPopup(true)}
          >
            View School Locations
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

        {/* --- STUDENTS LIST SECTION (NEW) --- */}
        <div className="students-box">
          <h2>Students</h2>

          <select
            className="grade-filter"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="all">All Grades</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>

          <input
            className="student-search"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />

          <div className="students-list">
            {searchedStudents.length === 0 ? (
              <p>No students found.</p>
            ) : (
              searchedStudents.map((s) => (
                <div key={s.id} className="student-row">
                  <div>
                    <p>
                      <strong>{s.firstName}</strong> ({s.email})
                    </p>
                    <p>Grade: {s.gradeLevel}</p>
                    <p>Day Passes: {s.dayPasses}</p>
                  </div>

                  <button
                    className="delete-student-btn"
                    onClick={() => handleDeleteStudent(s.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showLocationsPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>School Locations</h3>

            {school?.locations?.length > 0 ? (
              <ul>
                {school.locations.map((loc, index) => (
                  <li key={index}>{loc}</li>
                ))}
              </ul>
            ) : (
              <p>No locations found</p>
            )}

            <button
              className="close-popup-btn"
              onClick={() => setShowLocationsPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showSettings && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Settings</h3>

            <label>Max Daily Passes</label>
            <input
              type="number"
              min={1}
              max={25}
              value={maxDailyPasses}
              onChange={(e) => setMaxDailyPasses(e.target.value)}
              className="settings-input"
            />

            {settingsMessage && (
              <p className="settings-message">{settingsMessage}</p>
            )}

            <button
              className="set-passes-btn"
              onClick={() => {
                changeSchoolMaxPasses(maxDailyPasses);

                setTimeout(() => setSettingsMessage(""), 1500);
              }}
            >
              Save
            </button>

            <button
              className="close-popup-btn"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
