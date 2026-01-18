import { Router } from "express";
import {
  getCurrentUser,
  googleLogin,
  login,
  logout,
} from "../controllers/authController.js";

const router = Router();

router.get("/me", getCurrentUser);
router.post("/google", googleLogin);
router.post("/login", login);
router.post("/logout", logout);

export default router;
