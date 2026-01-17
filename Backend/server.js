import "dotenv/config";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const schools = [];
const users = [];

function generateToken(id, role, schoolID) {
  return jwt.sign({ id, role, schoolID }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}

function authenticateToken(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}

app.get("/auth/me", (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const userExists = users.find((u) => u.id === user.id);
    if (!userExists) return res.sendStatus(404);
    const username = userExists.username;
    res.json({ username: username });
  });
});

app.post("/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email } = payload;

    // Only allow login if user already exists
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found for this email" });
    }

    // Update missing names if Google provides them
    if (!user.firstName || !user.lastName) {
      user.firstName = payload.given_name;
      user.lastName = payload.family_name;
    }

    const accessToken = generateToken(user.id, user.role, user.schoolID);

    let duration;

    if (user.role === "admin") duration = 7 * 24 * 60 * 60 * 1000; // 1 week
    else duration = 180 * 24 * 60 * 60 * 1000; // 6 months for students/teachers

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: duration,
    });

    res.json({
      message: "Logged in with Google",
      user: {
        id: user.id,
        username: user.username,
        firstName: payload.given_name,
        lastName: payload.family_name,
        role: user.role,
        gradeLevel: user.gradeLevel,
        subjects: user.subjects || null,
        schoolID: user.schoolID,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

app.get("/students", (req, res) => {
  const students = users.filter((u) => u.role === "student");
  res.json(students);
});

app.get("/dayPasses", (req, res) => {
  const students = users.filter((u) => u.role === "student");
  res.json(students.dayPasses);
});

app.get("/teachers", (req, res) => {
  const teachers = users.filter((u) => u.role === "teacher");
  res.json(teachers);
});

app.get("/schools", (req, res) => {
  res.json(schools);
});

app.get("/admin", (req, res) => {
  const admins = users.filter((u) => u.role === "admin");
  res.json(admins);
});

app.post("/register-school", async (req, res) => {
  console.log("BODY RECEIVED:", req.body);

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
    const missing = required.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: "Missing required fields", missing });
    }
    const domain = req.body.domain;
    if (!/^@?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      return res.status(400).json({ message: "Invalid domain format" });
    }

    const adminEmail = req.body.adminEmail;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (req.body.password.length < 8) {
      return res.status(400).json({ message: "Password length too short" });
    }
    if (req.body.inviteCode !== process.env.INVITE_CODE) {
      return res.status(400).json({ message: "Invalid invite code" });
    }

    if (schools.some((school) => school.name === req.body.name)) {
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
      adminID: adminID,
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
      password: hashedPassword, // hashed version of req.body.password
      role: "admin", // admin || teacher || student
      gradeLevel: null, // for student
      subjects: null, // for teacher
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
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ message: "School added", loggedIn: true });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.post(
  "/student/create",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
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

    const hashedPassword = await bcrypt.hash("1", 10); // temporary
    // Create the student
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
      schoolID: req.user.schoolID, // student belongs to admin's school
      password: hashedPassword, // or generate one
    };

    users.push(student);

    res.json({
      message: `Student created with email ${student.email}`,
      student,
    });
  }
);

app.post(
  "/teacher/create",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { email, firstName, lastName, subjects } = req.body;

    if (!email || !firstName || !lastName || !subjects) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const subjectsArray = subjects.split(",").map((s) => s.trim());

    const hashedPassword = await bcrypt.hash("1", 10); // temporary
    // Create the teacher
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
      schoolID: req.user.schoolID, // teacher belongs to admin's school
      password: hashedPassword, // or generate one
    };
    const userSchool = schools.find((s) => s.id === req.user.schoolID);
    userSchool.teachers.push(teacher);
    users.push(teacher);

    res.json({
      message: `Teacher created with email ${teacher.email}`,
      teacher,
    });
  }
);

app.post("/users/login", async (req, res) => {
  const user = users.find((user) => user.email === req.body.email);
  if (!user) return res.status(400).send("Cannot find user");
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateToken(user.id, user.role, user.schoolID);
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({
        message: "Logged in",
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          gradeLevel: user.gradeLevel,
          subjects: user.subjects,
          schoolID: user.schoolID,
        },
      });
    } else {
      res.json({ message: "Not allowed" });
    }
  } catch {
    res.status(500).send();
  }
});

app.get("/users/current", authenticateToken, (req, res) => {
  const fullUser = users.find((u) => u.id === req.user.id);

  if (!fullUser) return res.sendStatus(404);

  res.json({
    user: {
      id: fullUser.id,
      username: fullUser.username,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      role: fullUser.role,
      gradeLevel: fullUser.gradeLevel,
      subjects: fullUser.subjects,
      dayPasses: fullUser.dayPasses,
      pass: fullUser.pass || null,
      schoolID: fullUser.schoolID,
    },
  });
});

app.get("/school/teachers", authenticateToken, (req, res) => {
  const user = req.user;

  const userSchool = schools.find((s) => s.id === user.schoolID);
  if (!userSchool) {
    return res.json({ message: "School not found" });
  }

  const teacherObjects = userSchool.teachers.map((teacher) => ({
    id: teacher.id,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
    profile: teacher.profile,
    autoPassLocations: teacher.autoPassLocations,
    subjects: teacher.subjects,
  }));

  return res.json({ teachers: teacherObjects });
});

app.get("/school/destinations", authenticateToken, (req, res) => {
  const user = req.user;

  const userSchool = schools.find((s) => s.id === user.schoolID);
  if (!userSchool) {
    return res.json({ message: "School not found" });
  }

  const destinations = userSchool.locations;

  return res.json({ destinations: destinations });
});

app.post("/pass/create", authenticateToken, (req, res) => {
  const { destination, fromTeacher, purpose } = req.body;
  if (req.user.role !== "student")
    return res.json({ message: "Only students can create passes!" });
  if (!destination || !fromTeacher) {
    return res.json({ message: "Missing required fields" });
  }
  if (purpose && purpose.length > 50) {
    return res.json({ message: "Purpose too long." });
  }

  const user = users.find((u) => u.id === req.user.id);
  const userSchool = schools.find((s) => s.id === user.schoolID);
  const teacher = users.find(
    (u) => u.role === "teacher" && u.id === fromTeacher
  );

  if (user.pass && user.pass.status === "active") {
    return res.json({ message: "Pass already ongoing!" });
  }
  if (user.pass) {
    if (
      !user.pass.status === "expired" ||
      !user.pass.status === "cancelled" ||
      !user.pass.status === "ended"
    ) {
      return res.json({ message: "User has pass already!" });
    }
  }

  if (user.dayPasses >= userSchool.maxPassesDaily) {
    return res.json({ message: "Max passes reached!" });
  }

  const teacherDestination = users.find(
    (u) => u.role === "teacher" && u.id === destination
  );

  const isTeacherDestination = Boolean(teacherDestination);
  const isLocationDestination = userSchool.locations.includes(destination);

  if (!isTeacherDestination && !isLocationDestination) {
    return res.json({ message: "Invalid destination" });
  }

  const autoPassAllowed = Array.isArray(teacher.autoPassLocations)
    ? teacher.autoPassLocations.includes(destination)
    : false;

  const pass = {
    id: crypto.randomUUID(),
    studentID: user.id,
    studentGrade: user.gradeLevel,
    status: "waiting", // active, cancelled, ended, waiting, expired
    fromTeacher,
    destination,
    purpose,
    autoPass: autoPassAllowed,
    start: null,
    end: null,
  };

  user.pass = pass;
  user.dayPasses++;

  return res.json({ message: "Pass created", pass });
});

app.post("/pass/start", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  const pass = user.pass;

  if (!pass || pass.status !== "waiting") {
    return res.json({ message: "No pass waiting to start" });
  }

  // If autopass is false, only teacher can start
  if (!pass.autoPass && req.user.role !== "teacher") {
    return res.json({ message: "Teacher approval required" });
  }

  pass.status = "active";
  pass.start = Date.now();

  return res.json({ message: "Pass started", pass });
});

app.post("/pass/end", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  const pass = user.pass;

  if (!pass || pass.status !== "active") {
    return res.json({ message: "No active pass to end" });
  }

  pass.status = "ended";
  pass.end = Date.now();

  return res.json({ message: "Pass ended", pass });
});

app.post("/pass/cancel", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  const pass = user.pass;

  if (!pass || pass.status !== "waiting") {
    return res.json({ message: "No pending pass to cancel" });
  }

  pass.status = "cancelled";
  pass.start = Date.now();
  return res.json({ message: "Pass cancelled", pass });
});

app.post("/logout", (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401);
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "lax",
  });
  res.json({ message: "Logged out" });
});

// AUTO-EXPIRE PASSES
const MAX_PASS_DURATION = 15 * 60 * 1000;
setInterval(() => {
  users.forEach((user) => {
    const pass = user.pass;
    if (pass && pass.status === "active" && pass.start) {
      if (Date.now() - pass.start > MAX_PASS_DURATION) {
        pass.status = "expired";
        pass.end = Date.now();
      }
    }
  });
}, 60 * 1000); // check every minute

// AUTO-DELETE EXPIRED PASSES
const MAX_EXPIRED_PASS_DURATION = 5 * 60 * 1000;

setInterval(() => {
  users.forEach((user) => {
    const pass = user.pass;
    if (!pass) return;

    const isInactive =
      pass.status === "expired" ||
      pass.status === "cancelled" ||
      (pass.status === "ended" && pass.end);

    if (!isInactive) return;

    // Use end time if available, otherwise start time
    const referenceTime = pass.end || pass.start;

    if (Date.now() - referenceTime > MAX_EXPIRED_PASS_DURATION) {
      user.pass = null;
    }
  });
}, 60 * 1000);

app.listen(3000);
