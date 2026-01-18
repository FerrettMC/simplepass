import users from "../models/users.js";
import schools from "../models/schools.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET /teachers
export function getTeachers(req, res) {
  const teachers = users.filter((u) => u.role === "teacher");
  res.json(teachers);
}

// POST /teacher/create
export async function createTeacher(req, res) {
  const { email, firstName, lastName, subjects } = req.body;

  if (!email || !firstName || !lastName || !subjects) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

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
    autoPassLocations: ["hartwig"],
    subjects: subjectsArray,
    lastReset: null,
    dayPasses: null,
    pass: null,
    createdAt: Date.now(),
    schoolID: req.user.schoolID,
    password: hashedPassword,
  };

  const school = schools.find((s) => s.id === req.user.schoolID);
  school.teachers.push(teacher);
  users.push(teacher);

  res.json({
    message: `Teacher created with email ${teacher.email}`,
    teacher,
  });
}
