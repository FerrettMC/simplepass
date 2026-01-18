import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import passRoutes from "./routes/passRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";

import "./jobs/expirePasses.js";
import "./jobs/cleanupPasses.js";

const app = express();

app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/pass", passRoutes);
app.use("/school", schoolRoutes);

export default app;
