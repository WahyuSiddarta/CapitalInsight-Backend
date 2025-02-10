"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rateLimiter_1 = require("../middleware/rateLimiter");
const logger_1 = __importDefault(require("../logger")); // Import the logger
const router = express_1.default.Router();
// Apply default rate limiter to all routes
router.use((req, res, next) => {
    logger_1.default.info(`Applying default rate limiter to route: ${req.path}`);
    next();
}, rateLimiter_1.apiLimiter);
// Apply custom rate limiter to specific routes
router.use("/special-api", (req, res, next) => {
    logger_1.default.info(`Applying custom rate limiter to route: ${req.path}`);
    next();
}, (0, rateLimiter_1.customApiLimiter)({ windowMs: 10 * 60 * 1000, max: 50 }));
// Define routes
router.get("/special-api", (req, res) => {
    logger_1.default.debug("Special API route hit");
    res.send("Special API response");
});
// Define other routes
router.get("/another-api", (req, res) => {
    logger_1.default.warn("Another API route hit");
    res.send("Another API response");
});
// Test route to ensure router is working
router.get("/test", (req, res) => {
    logger_1.default.error("Test route hit");
    res.send("Test route response");
});
// ...define more routes as needed...
exports.default = router;
