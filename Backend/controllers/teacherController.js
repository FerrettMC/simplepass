import users from "../models/users.js";
import schools from "../models/schools.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET /teachers
export function getTeachers(req, res) {
  const teachers = users.filter((u) => u.role === "teacher");
  res.json(teachers);
}

// POST /teachers/create
export async function createTeacher(req, res) {
  const { email, firstName, lastName, subjects } = req.body;

  if (!email || !firstName || !lastName || !subjects) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  const userFree = users.find((u) => u.email === email);
  if (userFree) return res.status(400).json({ message: "Email in use!" });

  const subjectsArray = subjects.split(",").map((s) => s.trim());
  const hashedPassword = await bcrypt.hash("1", 10);

  const teacher = {
    id: crypto.randomUUID(),
    username: email.split("@")[0],
    firstName,
    lastName,
    email,
    profile: "",
    role: "teacher",
    autoPassLocations: [],
    subjects: subjectsArray,
    lastReset: null,
    dayPasses: null,
    pass: null,
    createdAt: Date.now(),
    schoolID: req.user.schoolID,
    password: hashedPassword, // TODO: Make something out of this lol (maybe remove)
  };

  const school = schools.find((s) => s.id === req.user.schoolID);
  school.teachers.push(teacher);
  users.push(teacher);

  res.json({
    message: `Teacher created with email ${teacher.email}`,
    teacher,
  });
}

// GET /teachers/passes
export function getTeacherPasses(req, res) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Must be teacher" });
  }

  // Find the teacher making the request
  const teacher = users.find((u) => u.id === req.user.id);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  // Get all students in the same school
  const students = users.filter(
    (u) => u.role === "student" && u.schoolID === teacher.schoolID,
  );

  // Collect passes that exist and are waiting
  const waitingPasses = students
    .filter((s) => s.pass)
    .map((s) => ({
      studentID: s.id,
      studentName: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
      gradeLevel: s.gradeLevel,
      pass: s.pass,
    }));

  res.json({ passes: waitingPasses });
}

// POST /teachers/add-autopass-location
export function addTeacherAutoPassLocation(req, res) {
  const user = users.find((u) => u.id === req.user.id);
  const school = schools.find((s) => s.id === req.user.schoolID);
  const location = req.body.location;

  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }
  if (!user) {
    return res.status(404).json({ message: "Teacher not found" });
  }
  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }
  if (user.role !== "teacher") {
    return res.status(403).json({ message: "Must be a teacher" });
  }
  if (user.autoPassLocations.includes(location)) {
    return res
      .status(400)
      .json({ message: "Location already in teacher autopass locations" });
  }
  if (!school.locations.includes(location)) {
    return res.status(404).json({ message: "School location not found" });
  }

  user.autoPassLocations.push(location);

  return res.json({
    message: "Location added",
    autoPassLocations: user.autoPassLocations,
  });
}

// POST /teachers/remove-autopass-location
export function removeTeacherAutoPassLocation(req, res) {
  const user = users.find((u) => u.id === req.user.id);
  const school = schools.find((s) => s.id === req.user.schoolID);
  const location = req.body.location;

  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }
  if (!user) {
    return res.status(404).json({ message: "Teacher not found" });
  }
  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }
  if (user.role !== "teacher") {
    return res.status(403).json({ message: "Must be a teacher" });
  }
  if (!user.autoPassLocations.includes(location)) {
    return res
      .status(400)
      .json({ message: "Location not in teacher autopass locations" });
  }
  if (!school.locations.includes(location)) {
    return res.status(404).json({ message: "School location not found" });
  }

  user.autoPassLocations = user.autoPassLocations.filter(
    (loc) => loc !== location,
  );

  return res.json({
    message: "Location removed",
    autoPassLocations: user.autoPassLocations,
  });
}
