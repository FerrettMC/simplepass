// models/User.js
import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    required: true,
    unique: true,
  },
  username: { type: String, required: true },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  gradeLevel: { type: String, default: null },
  autoPassLocations: { type: Array, default: null },
  subjects: { type: Array, default: null },
  pass: { type: Object, default: null },
  lastReset: { type: Number, default: () => Date.now() },
  dayPasses: { type: Number, default: 0 },
  createdAt: { type: Number, default: () => Date.now() },
  favoriteDestinations: { type: [String], default: [] },
  favoriteTeachers: { type: [String], default: [] },
  schoolID: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model("User", userSchema);
