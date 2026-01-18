import users from "../models/users.js";
import schools from "../models/schools.js";
import crypto from "crypto";

// POST /pass/create
export function createPass(req, res) {
  const { destination, fromTeacher, purpose } = req.body;

  if (req.user.role !== "student")
    return res.json({ message: "Only students can create passes!" });

  if (!destination || !fromTeacher)
    return res.json({ message: "Missing required fields" });

  if (purpose && purpose.length > 50)
    return res.json({ message: "Purpose too long." });

  const user = users.find((u) => u.id === req.user.id);
  const school = schools.find((s) => s.id === user.schoolID);
  const teacher = users.find(
    (u) => u.role === "teacher" && u.id === fromTeacher,
  );

  if (user.pass && user.pass.status === "active")
    return res.json({ message: "Pass already ongoing!" });

  if (user.dayPasses >= school.maxPassesDaily)
    return res.json({ message: "Max passes reached!" });

  const teacherDestination = users.find(
    (u) => u.role === "teacher" && u.id === destination,
  );

  const isTeacherDestination = Boolean(teacherDestination);
  const isLocationDestination = school.locations.includes(destination);

  if (!isTeacherDestination && !isLocationDestination)
    return res.json({ message: "Invalid destination" });

  const autoPassAllowed = Array.isArray(teacher.autoPassLocations)
    ? teacher.autoPassLocations.includes(destination)
    : false;

  const pass = {
    id: crypto.randomUUID(),
    studentID: user.id,
    studentGrade: user.gradeLevel,
    status: "waiting",
    fromTeacher,
    destination,
    purpose,
    autoPass: autoPassAllowed,
    start: null,
    end: null,
  };

  user.pass = pass;
  user.dayPasses++;

  res.json({ message: "Pass created", pass });
}

// POST /pass/start
export function startPass(req, res) {
  const user = users.find((u) => u.id === req.user.id);
  const pass = user.pass;

  if (!pass || pass.status !== "waiting")
    return res.json({ message: "No pass waiting to start" });

  if (!pass.autoPass && req.user.role !== "teacher")
    return res.json({ message: "Teacher approval required" });

  pass.status = "active";
  pass.start = Date.now();

  res.json({ message: "Pass started", pass });
}

// POST /pass/end
export function endPass(req, res) {
  const user = users.find((u) => u.id === req.user.id);
  const pass = user.pass;

  if (!pass || pass.status !== "active")
    return res.json({ message: "No active pass to end" });

  pass.status = "ended";
  pass.end = Date.now();

  res.json({ message: "Pass ended", pass });
}

// POST /pass/cancel
export function cancelPass(req, res) {
  const user = users.find((u) => u.id === req.user.id);
  const pass = user.pass;

  if (!pass || pass.status !== "waiting")
    return res.json({ message: "No pending pass to cancel" });

  pass.status = "cancelled";
  pass.start = Date.now();

  res.json({ message: "Pass cancelled", pass });
}
