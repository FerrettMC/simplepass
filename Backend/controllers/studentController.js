import users from "../models/users.js";
import schools from "../models/schools.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET /students
export function getStudents(req, res) {
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const students = users.filter((u) => u.role === "student");
  const schoolStudents = students.filter((s) => s.schoolID === user.schoolID);
  if (schoolStudents.length === 0) {
    return res.json({
      students: [],
      message: "No students found for this school.",
    });
  }
  const finalStudents = schoolStudents.map((s) => ({
    id: s.id,
    username: s.username,
    firstName: s.firstName || s.email,
    lastName: s.lastName || null,
    email: s.email,
    role: s.role,
    gradeLevel: s.gradeLevel,
    dayPasses: s.dayPasses,
  }));

  return res.json({
    students: finalStudents,
    message: "School students found.",
  });
}

// POST /students/create
export async function createStudent(req, res) {
  const { email, gradeLevel } = req.body;

  if (!email || !gradeLevel) {
    return res.status(400).json({ message: "Missing fields" });
  }
  if (gradeLevel < 1 || gradeLevel > 12) {
    return res.status(400).json({ message: "Invalid grade level" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  const userFree = users.find((u) => u.email === email);
  if (userFree) return res.status(400).json({ message: "Email in use!" });

  const hashedPassword = await bcrypt.hash("1", 10);

  const student = {
    id: crypto.randomUUID(),
    username: email.split("@")[0],
    firstName: null,
    lastName: null,
    email,
    role: "student",
    gradeLevel,
    autoPassLocations: null,
    subjects: null,
    pass: null,
    lastReset: Date.now(),
    dayPasses: 0,
    createdAt: Date.now(),
    favoriteDestinations: [],
    favoriteTeachers: [],
    schoolID: req.user.schoolID,
    password: hashedPassword,
  };

  users.push(student);

  res.json({
    message: `Student created with email ${student.email}`,
    student,
  });
}

// POST /students/delete
export async function deleteStudent(req, res) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const admin = users.find((u) => u.id === req.user.id);
  if (!admin) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (admin.schoolID !== user.schoolID) {
    return res.status(403).json({ message: "Not allowed: different school" });
  }

  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users.splice(index, 1);
  }

  res.json({ message: "Student deleted" });
}
