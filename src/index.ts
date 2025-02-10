import express from "express";
import pool from "./db/postgres";
import authRoutes from "./routes/authRoutes";
import stockRoutes from "./routes/StockRoutes";
import compression from "compression"; // Import the compression middleware
import {
  authenticateJWT,
  apiLimiter,
  authenticateRefreshJWT,
} from "./middleware";
import { login, register, refreshToken } from "./controllers/authController";

import logger from "./logger";

const app = express();
const port = 3000;
const hostName = "0.0.0.0";

app.use(express.json());

app.use("/api", apiLimiter); // Apply rate limiter to all /api routes

app.get("/api/ping", (req, res) => {
  res.send("pong");
});

const startServer = async () => {
  try {
    await pool.connect();
    logger.info("Connected to the database");

    app.listen(port, hostName as string, () => {
      logger.info(`Server is running on port ${port}`);

      app.use("/api/public", authenticateJWT, authRoutes);
      // Apply JWT middleware and prefix /private to stockRoutes
      app.use("/api/private", authenticateJWT, stockRoutes);

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
    });
  } catch (err) {
    logger.error("Failed to connect to the database", err);
    process.exit(1);
  }
};

startServer();
