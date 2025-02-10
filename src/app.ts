import express from "express";
import router from "./routes/index";
import userRouter from "./routes/userRoutes";
import productRouter from "./routes/productRoutes";
import authRouter from "./routes/authRoutes";

import logger from "./logger"; // Import the logger
import { authenticateJWT } from "./middleware/auth"; // Import the JWT middleware

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

// Basic test route
app.get("/", (req, res) => {
  logger.info("Root route hit");
  res.send("Server is running");
});

// Use the authentication router
app.use("/api/auth", authRouter);

// Use the JWT authentication middleware for protected routes
// app.use(authenticateJWT);

// Use the router
app.use(
  "/api",
  (req, res, next) => {
    logger.info(`API route hit: ${req.path}`);
    next();
  },
  router
);

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
// app.use("/api/stock", stockRouter);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(`Error occurred: ${err.message}`);
    res.status(500).send("Something broke!");
  }
);

export default app;
