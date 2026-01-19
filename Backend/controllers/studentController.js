import users from "../models/users.js";
import schools from "../models/schools.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET /students
export function getStudents(req, res) {
  const students = users.filter((u) => u.role === "student");
  res.json(students);
}

// POST /student/create
export async function createStudent(req, res) {
  const { email, gradeLevel } = req.body;

  if (!email || !gradeLevel) {
    return res.status(400).json({ message: "Missing fields" });
  }
  if (gradeLevel < 1 || gradeLevel > 8) {
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
    profile: null,
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
