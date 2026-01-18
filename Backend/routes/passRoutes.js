import { Router } from "express";
import {
  createPass,
  startPass,
  endPass,
  cancelPass,
} from "../controllers/passController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = Router();

router.post("/create", authenticateToken, createPass);
router.post("/start", authenticateToken, startPass);
router.post("/end", authenticateToken, endPass);
router.post("/cancel", authenticateToken, cancelPass);

export default router;
