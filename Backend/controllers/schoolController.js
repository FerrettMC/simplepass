import schools from "../models/schools.js";
import users from "../models/users.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken from "../utils/generateToken.js";

// GET /schools
export function getSchools(req, res) {
  res.json(schools);
}

// GET /school/teachers
export function getSchoolTeachers(req, res) {
  const school = schools.find((s) => s.id === req.user.schoolID);
  if (!school) return res.json({ message: "School not found" });

  const teacherObjects = school.teachers.map((t) => ({
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
export function getDestinations(req, res) {
  const school = schools.find((s) => s.id === req.user.schoolID);
  if (!school) return res.json({ message: "School not found" });

  res.json({ destinations: school.locations });
}

// POST /register-school
export async function registerSchool(req, res) {
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
  }

  if (schools.some((s) => s.name === req.body.name)) {
    return res.status(401).json({ message: "School name taken!" });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const adminID = crypto.randomUUID();

  const school = {
    name: req.body.name,
    domain: req.body.domain,
    adminFirstName: req.body.adminName,
    adminLastName: req.body.adminLastName,
    adminEmail: req.body.adminEmail,
    maxPassesDaily: 5,
    locations: ["hartwig"],
    teachers: [],
    adminID,
    createdAt: Date.now(),
    id: crypto.randomUUID(),
  };

  const admin = {
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
    schoolID: school.id,
  };

  users.push(admin);
  schools.push(school);

  const accessToken = generateToken(admin.id, admin.role, admin.schoolID);

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: "School added", loggedIn: true });
}
