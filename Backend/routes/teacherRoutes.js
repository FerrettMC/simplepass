import { Router } from "express";
import {
  getTeachers,
  createTeacher,
  getTeacherPasses,
} from "../controllers/teacherController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

router.get("/", getTeachers);
router.post("/create", authenticateToken, requireAdmin, createTeacher);
router.get("/passes", authenticateToken, getTeacherPasses);

export default router;
