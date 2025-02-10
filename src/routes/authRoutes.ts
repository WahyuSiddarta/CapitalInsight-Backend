import { Router } from "express";
import { login, register, refreshToken } from "../controllers/authController";
import { authenticateRefreshJWT } from "../middleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh-token", authenticateRefreshJWT, refreshToken);

export default router;
