import User from "../data/user.js";
import School from "../data/school.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET /teachers
export async function getTeachers(req, res) {
  try {
    // 1. Fetch the logged-in user (admin)
    const admin = await User.findOne({ id: req.user.id });

    if (!admin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 2. Fetch teachers from MongoDB
    const teachers = await User.find({
      schoolID: admin.schoolID,
      role: "teacher",
    });

    // 3. Return them
    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ message: "Server error fetching teachers" });
  }
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

  // Check if email already exists
  const userFree = await User.findOne({ email });
  if (userFree) {
    return res.status(400).json({ message: "Email in use!" });
  }

  const subjectsArray = subjects.split(",").map((s) => s.trim());
  const hashedPassword = await bcrypt.hash("1", 10);

  // Create teacher user
  const teacher = await User.create({
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
    password: hashedPassword,
  });

  // Add teacher reference to school
  const school = await School.findOne({ id: req.user.schoolID });

  school.teachers.push({
    id: teacher.id,
    firstName,
    lastName,
    email,
  });

  await school.save();

  res.json({
    message: `Teacher created with email ${teacher.email}`,
    teacher,
  });
}

// GET /teachers/passes
export async function getTeacherPasses(req, res) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Must be teacher" });
  }

  // Find the teacher making the request
  const teacher = await User.findOne({ id: req.user.id });

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  // Get all students in the same school
  const students = await User.find({
    role: "student",
    schoolID: teacher.schoolID,
  });

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
export async function addTeacherAutoPassLocation(req, res) {
  const user = await User.findOne({ id: req.user.id });

  const school = await School.findOne({ id: req.user.schoolID });

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
  await user.save();

  return res.json({
    message: "Location added",
    autoPassLocations: user.autoPassLocations,
  });
}

// POST /teachers/remove-autopass-location
export async function removeTeacherAutoPassLocation(req, res) {
  const user = await User.findOne({ id: req.user.id });

  const school = await School.findOne({ id: req.user.schoolID });
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

  await user.save();

  return res.json({
    message: "Location removed",
    autoPassLocations: user.autoPassLocations,
  });
}
