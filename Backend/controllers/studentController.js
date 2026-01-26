import User from "../data/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// GET /students
export async function getStudents(req, res) {
  try {
    // 1. Fetch the logged-in user correctly
    const user = await User.findOne({ id: req.user.id });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2. Fetch students from MongoDB instead of an array
    const schoolStudents = await User.find({
      schoolID: user.schoolID,
      role: "student",
    });

    if (schoolStudents.length === 0) {
      return res.json({
        students: [],
        message: "No students found for this school.",
      });
    }

    // 3. Map the results (same as before)
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching students" });
  }
}

// POST /students/create
export async function createStudent(req, res) {
  try {
    const { email, gradeLevel } = req.body;

    // Basic validation
    if (!email || !gradeLevel) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (gradeLevel < 1 || gradeLevel > 12) {
      return res.status(400).json({ message: "Invalid grade level" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email in use!" });
    }

    // Temporary password (hashed)
    const hashedPassword = await bcrypt.hash("1", 10);

    // Build student object
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

    // Save to MongoDB
    const createdStudent = await User.create(student);

    res.json({
      message: `Student created with email ${student.email}`,
      student: createdStudent,
    });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ message: "Server error creating student" });
  }
}

// POST /students/delete
export async function deleteStudent(req, res) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const admin = await User.findOne({ id: req.user.id });
  if (!admin) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const student = await User.findOne({ id });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (admin.schoolID !== student.schoolID) {
    return res.status(403).json({ message: "Not allowed: different school" });
  }

  await User.deleteOne({ id });

  res.json({ message: "Student deleted" });
}
