import mongoose from "mongoose";
import crypto from "crypto";

const schoolSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true,
    required: true,
  },

  name: {
    type: String,
    required: true,
    unique: true,
  },

  domain: {
    type: String,
    required: true,
  },

  adminFirstName: String,
  adminLastName: String,
  adminEmail: String,

  maxPassesDaily: {
    type: Number,
    default: 5,
  },

  locations: {
    type: Array,
    default: [],
  },

  teachers: {
    type: Array,
    default: [],
  },

  adminID: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

export default mongoose.model("School", schoolSchema);
