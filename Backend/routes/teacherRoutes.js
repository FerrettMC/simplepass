import { Router } from "express";
import {
  getTeachers,
  createTeacher,
} from "../controllers/teacherController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

router.get("/", getTeachers);
router.post("/create", authenticateToken, requireAdmin, createTeacher);

export default router;
