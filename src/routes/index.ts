import express from "express";
import { apiLimiter, customApiLimiter } from "../middleware/rateLimiter";
import logger from "../logger"; // Import the logger

const router = express.Router();

// Apply default rate limiter to all routes
router.use((req, res, next) => {
  logger.info(`Applying default rate limiter to route: ${req.path}`);
  next();
}, apiLimiter);

// Apply custom rate limiter to specific routes
router.use(
  "/special-api",
  (req, res, next) => {
    logger.info(`Applying custom rate limiter to route: ${req.path}`);
    next();
  },
  customApiLimiter({ windowMs: 10 * 60 * 1000, max: 50 })
);

// Define routes
router.get("/special-api", (req, res) => {
  logger.debug("Special API route hit");
  res.send("Special API response");
});

// Define other routes
router.get("/another-api", (req, res) => {
  logger.warn("Another API route hit");
  res.send("Another API response");
});

// Test route to ensure router is working
router.get("/test", (req, res) => {
  logger.error("Test route hit");
  res.send("Test route response");
});

// ...define more routes as needed...

export default router;
