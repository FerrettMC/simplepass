import { Router } from "express";
import {
  getStudents,
  createStudent,
} from "../controllers/studentController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

router.get("/", getStudents);
router.post("/create", authenticateToken, requireAdmin, createStudent);

export default router;
