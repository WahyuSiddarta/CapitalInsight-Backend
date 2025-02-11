import express from "express";
import pool from "./db/postgres";
import authRoutes from "./routes/authRoutes";
import stockRoutes from "./routes/StockRoutes";
import compression from "compression"; // Import the compression middleware
import { authenticateJWT, apiLimiter } from "./middleware";
import cors from "cors";

import logger from "./logger";

const app = express();
const port = 3000;
const hostName = "0.0.0.0";

app.use(express.json()); // Ensure this is applied before routes
app.use(express.urlencoded({ extended: true })); // Add this line to handle URL-encoded data

app.use(
  cors({
    origin: "*", // Allow all origins (change this for security)
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization, x-no-compression",
  })
);
app.use("/api", apiLimiter); // Apply rate limiter to all /api routes

app.get("/api/ping", (req, res) => {
  res.send("pong");
});

// Example GET API to handle query parameters
app.get("/api/query", (req, res) => {
  const queryParam = req.query.param;
  res.json({ message: `Received query param: ${queryParam}` });
});

// Example GET API to handle URL parameters
app.get("/api/item/:id", (req, res) => {
  const itemId = req.params.id;
  res.json({ message: `Received URL param: ${itemId}` });
});

const startServer = async () => {
  try {
    await pool.connect();
    logger.info("Connected to the database");

    app.listen(port, hostName as string, () => {
      logger.info(`Server is running on port ${port}`);

      app.use("/api/public", authRoutes);
      // Apply JWT middleware and prefix /private to stockRoutes
      app.use("/api/private", authenticateJWT, stockRoutes);

      app.use(
        compression({
          filter: (req, res) => {
            if (req.headers["x-no-compression"]) {
              return false; // Bypass compression if the client requests it
            }
            return compression.filter(req, res); // Use default filter
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
