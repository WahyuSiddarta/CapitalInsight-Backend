import express from "express";
import pool from "./db/postgres";
import { login, register, refreshToken } from "./controllers/authController";
import stockRoutes from "./routes/StockRoutes";
import compression from "compression"; // Import the compression middleware
import {
  authenticateRefreshJWT,
  authenticateJWT,
  apiLimiter,
} from "./middleware";
import logger from "./logger";

const app = express();
const port = 3000;
const hostName = "0.0.0.0";

app.use(express.json());

// Middleware to prefix all routes with /api
app.use("/api", (req, res, next) => {
  next();
});

app.use("/api", apiLimiter); // Apply rate limiter to all /api routes

app.get("/ping", (req, res) => {
  res.send("pong");
});

const startServer = async () => {
  try {
    await pool.connect();
    logger.info("Connected to the database");

    app.post("/public/login", login);
    app.post("/public/register", register);
    app.post("/public/refresh-token", authenticateRefreshJWT, refreshToken);

    // Apply JWT middleware and prefix /private to stockRoutes
    app.use("/private", authenticateJWT, stockRoutes);

    app.use(
      compression({
        // Use compression middleware with Brotli options
        brotli: {
          enabled: true,
          zlib: {
            level: 11,
          },
        },
      })
    );

    app.listen(port, hostName as string, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (err) {
    logger.error("Failed to connect to the database", err);
    process.exit(1);
  }
};

startServer();
