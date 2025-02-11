"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const middleware_1 = require("../middleware");
const express_2 = __importDefault(require("express"));
const authRoutes = (0, express_1.Router)();
authRoutes.use(express_2.default.json()); // Ensure this is applied before routes
authRoutes.post("/login", authController_1.login);
authRoutes.post("/register", authController_1.register);
authRoutes.post("/refresh-token", middleware_1.authenticateRefreshJWT, authController_1.refreshToken);
exports.default = authRoutes;
