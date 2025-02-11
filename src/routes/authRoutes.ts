import { Router } from "express";
import { login, register, refreshToken } from "../controllers/authController";
import { authenticateRefreshJWT } from "../middleware";
import express from "express";

const authRoutes = Router();
authRoutes.use(express.json()); // Ensure this is applied before routes
authRoutes.post("/login", login);
authRoutes.post("/register", register);
authRoutes.post("/refresh-token", authenticateRefreshJWT, refreshToken);

export default authRoutes;
