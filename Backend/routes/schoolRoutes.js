import { Router } from "express";
import {
  getSchools,
  getSchoolTeachers,
  getDestinations,
  registerSchool,
  getSchool,
  addSchoolLocation,
} from "../controllers/schoolController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

router.get("/", getSchools);
router.get("/user", authenticateToken, getSchool);
router.get("/teachers", authenticateToken, getSchoolTeachers);
router.get("/destinations", authenticateToken, getDestinations);
router.post("/register", registerSchool);
router.post(
  "/new-location",
  authenticateToken,
  requireAdmin,
  addSchoolLocation,
);

export default router;
