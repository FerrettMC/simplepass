import { Router } from "express";
import {
  getStudents,
  createStudent,
  deleteStudent,
} from "../controllers/studentController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

router.get("/", authenticateToken, requireAdmin, getStudents);
router.post("/create", authenticateToken, requireAdmin, createStudent);
router.post("/delete", authenticateToken, requireAdmin, deleteStudent);

export default router;
