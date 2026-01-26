import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../data/user.js";
import School from "../data/school.js";
import generateToken from "../utils/generateToken.js";

// GET /school/teachers
export async function getSchoolTeachers(req, res) {
  const school = await School.findOne({ id: req.user.schoolID });
  if (!school) return res.json({ message: "School not found" });

  const teachers = await User.find({
    schoolID: req.user.schoolID,
    role: "teacher",
  });

  const teacherObjects = teachers.map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email,
    profile: t.profile,
    autoPassLocations: t.autoPassLocations,
    subjects: t.subjects,
  }));

  res.json({ teachers: teacherObjects });
}

// GET /school/destinations
export async function getDestinations(req, res) {
  const school = await School.findOne({ id: req.user.schoolID });
  if (!school) return res.json({ message: "School not found" });
  res.json({ destinations: school.locations });
}

// GET /school/user
export async function getSchool(req, res) {
  const school = await School.findOne({ id: req.user.schoolID });
  if (!school) return res.json({ message: "School not found" });

  res.json({
    school: {
      name: school.name,
      maxPassesDaily: school.maxPassesDaily,
      locations: school.locations,
      teachers: school.teachers,
    },
  });
}

// POST /school/register
export async function registerSchool(req, res) {
  try {
    const required = [
      "name",
      "domain",
      "adminName",
      "adminLastName",
      "username",
      "adminEmail",
      "password",
      "inviteCode",
    ];
    const missing = required.filter((f) => !req.body[f]);
    if (missing.length) {
      return res
        .status(400)
        .json({ message: "Missing required fields", missing });
    }
    if (req.body.inviteCode !== process.env.INVITE_CODE) {
      return res.status(400).json({ message: "Invalid invite code" });
    } // Check if school name already exists
    const existingSchool = await School.findOne({ name: req.body.name });
    if (existingSchool) {
      return res.status(401).json({ message: "School name taken!" });
    } // Hash admin password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const adminID = crypto.randomUUID();
    const schoolID = crypto.randomUUID();
    // Create school document
    const school = await School.create({
      id: schoolID,
      name: req.body.name,
      domain: req.body.domain,
      adminFirstName: req.body.adminName,
      adminLastName: req.body.adminLastName,
      adminEmail: req.body.adminEmail,
      maxPassesDaily: 5,
      locations: [],
      teachers: [],
      adminID,
      createdAt: Date.now(),
    });
    // Create admin user
    const admin = await User.create({
      id: adminID,
      username: req.body.username,
      firstName: req.body.adminName,
      lastName: req.body.adminLastName,
      email: req.body.adminEmail,
      profile: null,
      autoPassLocations: null,
      password: hashedPassword,
      role: "admin",
      gradeLevel: null,
      subjects: null,
      lastReset: null,
      dayPasses: null,
      pass: null,
      createdAt: Date.now(),
      schoolID: schoolID,
    });
    // Generate JWT
    const accessToken = generateToken(admin.id, admin.role, admin.schoolID);
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ message: "School added", loggedIn: true });
  } catch (err) {
    console.error("Error registering school:", err);
    res.status(500).json({ message: "Server error registering school" });
  }
}

// POST /school/new-location
export async function addSchoolLocation(req, res) {
  try {
    const location = req.body.location?.toLowerCase();

    if (!location) {
      return res.status(400).json({ message: "No location found!" });
    }

    // Fetch school from MongoDB
    const school = await School.findOne({ id: req.user.schoolID });

    if (!school) {
      return res.status(400).json({ message: "No school found!" });
    }

    // Check for duplicates
    if (school.locations.includes(location)) {
      return res.status(400).json({ message: "Location already in school" });
    }

    // Add location
    school.locations.push(location);

    // Save updated school document
    await school.save();

    res.json({ message: `Location added: ${location}`, location });
  } catch (err) {
    console.error("Error adding school location:", err);
    res.status(500).json({ message: "Server error adding location" });
  }
}

// POST /school/change-max-passes
export async function changeMaxPasses(req, res) {
  try {
    const school = await School.findOne({ id: req.user.schoolID });
    let passes = req.body.passes;

    if (!school) {
      return res.status(400).json({ message: "No school found!" });
    }

    if (!passes && passes !== 0) {
      return res.status(400).json({ message: "No passes value provided!" });
    }

    passes = Number(passes);

    if (passes < 1 || passes > 25) {
      return res.status(400).json({ message: "Passes not in accepted range" });
    }

    school.maxPassesDaily = passes;
    await school.save(); // <-- IMPORTANT

    res.json({ message: `Max passes changed to: ${passes}`, passes });
  } catch (err) {
    console.error("Error changing max passes:", err);
    res.status(500).json({ message: "Server error changing max passes" });
  }
}
