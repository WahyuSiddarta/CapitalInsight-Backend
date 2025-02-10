import { Router } from "express";
import { login, register, refreshToken } from "../controllers/authController";
import { authenticateRefreshJWT } from "../middleware";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/register", register);
authRoutes.post("/refresh-token", authenticateRefreshJWT, refreshToken);

export default authRoutes;
