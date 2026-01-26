import User from "../data/user.js";
import School from "../data/school.js";
import crypto from "crypto";
import { io } from "../server.js";

// POST /pass/create
export async function createPass(req, res) {
  const { destination, fromTeacher, purpose } = req.body;

  if (req.user.role !== "student")
    return res.json({ message: "Only students can create passes!" });

  if (!destination || !fromTeacher)
    return res.json({ message: "Missing required fields" });

  if (purpose && purpose.length > 50)
    return res.json({ message: "Purpose too long." });

  const user = await User.findOne({ id: req.user.id });

  const school = await School.findOne({ id: user.schoolID });

  const teacher = await User.findOne({
    id: fromTeacher,
    role: "teacher",
    schoolID: user.schoolID,
  });

  if (user.pass && user.pass.status === "active")
    return res.json({ message: "Pass already ongoing!" });

  if (user.dayPasses >= school.maxPassesDaily)
    return res.json({ message: "Max passes reached!" });

  const teacherDestination = await User.findOne({
    id: destination,
    role: "teacher",
    schoolID: user.schoolID,
  });

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
  await user.save();

  io.emit("passesUpdated");

  res.json({ message: "Pass created", pass });
}

// POST /pass/start
export async function startPass(req, res) {
  let user = null;
  let pass = null;

  // If a teacher provides a passID, start that student's pass
  if (req.body.passID) {
    // Teachers only
    if (req.user.role !== "teacher") {
      return res.json({
        message: "Only teachers can start another user's pass",
      });
    }

    user = await User.findOne({ "pass.id": req.body.passID });

    if (!user) {
      return res.json({ message: "Pass not found" });
    }

    if (req.user.schoolID !== user.schoolID) {
      return res.json({
        message: "Same school necessary",
      });
    }

    pass = user.pass;
    user.dayPasses = (user.dayPasses || 0) + 1;
  }

  // Students starting their own pass
  else {
    user = await User.findOne({ id: req.user.id });

    pass = user.pass;
    user.dayPasses = (user.dayPasses || 0) + 1;
  }

  // No pass or wrong status
  if (!pass || pass.status !== "waiting") {
    return res.json({ message: "No pass waiting to start" });
  }

  // Students need autoPass OR teacher approval
  if (req.user.role === "student" && !pass.autoPass) {
    return res.json({ message: "Teacher approval required" });
  }

  // Start the pass
  user.pass.status = "active";
  user.pass.start = Date.now();
  user.markModified("pass");

  await user.save();

  io.emit("passesUpdated");

  res.json({ message: "Pass started", pass });
}

// POST /pass/end
export async function endPass(req, res) {
  let user = null;
  let pass = null;

  // If a teacher provides a passID, end that student's pass
  if (req.body.passID) {
    // Teachers only
    if (req.user.role !== "teacher") {
      return res.json({
        message: "Only teachers can end another user's pass",
      });
    }

    user = await User.findOne({ "pass.id": req.body.passID });

    if (!user) {
      return res.json({ message: "Pass not found" });
    }

    if (req.user.schoolID !== user.schoolID) {
      return res.json({
        message: "Same school necessary",
      });
    }

    pass = user.pass;
  }

  // Students ending their own pass
  else {
    user = await User.findOne({ id: req.user.id });

    pass = user.pass;
  }

  if (!pass || pass.status !== "active")
    return res.json({ message: "No active pass to end" });

  user.pass.status = "ended";
  user.pass.end = Date.now();
  user.markModified("pass");

  await user.save();

  io.emit("passesUpdated");

  res.json({ message: "Pass ended", pass });
}

// POST /pass/cancel
export async function cancelPass(req, res) {
  let user = null;
  let pass = null;

  // If a teacher provides a passID, cancel that student's pass
  if (req.body.passID) {
    // Teachers only
    if (req.user.role !== "teacher") {
      return res.json({
        message: "Only teachers can start another user's pass",
      });
    }

    user = await User.findOne({ "pass.id": req.body.passID });

    if (!user) {
      return res.json({ message: "Pass not found" });
    }

    if (req.user.schoolID !== user.schoolID) {
      return res.json({
        message: "Same school necessary",
      });
    }

    pass = user.pass;
  }

  // Students cancelling their own pass
  else {
    user = await User.findOne({ id: req.user.id });

    pass = user.pass;
  }

  if (!pass || pass.status !== "waiting")
    return res.json({ message: "No pending pass to cancel" });

  user.pass.status = "cancelled";
  user.pass.start = Date.now();
  user.markModified("pass");
  await user.save();

  io.emit("passesUpdated");

  res.json({ message: "Pass cancelled", pass });
}
