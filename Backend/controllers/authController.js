import users from "../models/users.js";
import generateToken from "../utils/generateToken.js";
import googleClient from "../utils/googleClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// GET /auth/me
export function getCurrentUser(req, res) {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const fullUser = users.find((u) => u.id === user.id);
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
}

// POST /auth/google
export async function googleLogin(req, res) {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email } = payload;

    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: "No account found" });

    if (!user.firstName) user.firstName = payload.given_name;
    if (!user.lastName) user.lastName = payload.family_name;

    const accessToken = generateToken(user.id, user.role, user.schoolID);

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge:
        user.role === "admin"
          ? 7 * 24 * 60 * 60 * 1000
          : 180 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Logged in with Google",
      user,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid Google token" });
  }
}

// POST /users/login
export async function login(req, res) {
  const user = users.find((u) => u.email === req.body.email);
  if (!user) return res.status(400).send("Cannot find user");

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.json({ message: "Not allowed" });

  const accessToken = generateToken(user.id, user.role, user.schoolID);

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: false,
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
}

// POST /logout
export function logout(req, res) {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401);

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({ message: "Logged out" });
}
