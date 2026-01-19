import { Router } from "express";
import {
  getTeachers,
  createTeacher,
  getTeacherPasses,
  addTeacherAutoPassLocation,
  removeTeacherAutoPassLocation,
} from "../controllers/teacherController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

router.get("/", getTeachers);
router.post("/create", authenticateToken, requireAdmin, createTeacher);
router.get("/passes", authenticateToken, getTeacherPasses);
router.post(
  "/add-autopass-location",
  authenticateToken,
  addTeacherAutoPassLocation,
);
router.post(
  "/remove-autopass-location",
  authenticateToken,
  removeTeacherAutoPassLocation,
);

export default router;
