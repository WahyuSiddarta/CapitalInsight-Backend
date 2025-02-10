import express from "express";
import pool from "./db/postgres";
import { login, register, refreshToken } from "./controllers/authController";
import * as controller from "./controllers";

const app = express();
const port = 3000;
const hostName = "0.0.0.0";

app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("pong");
});

const startServer = async () => {
  try {
    await pool.connect();
    console.log("Connected to the database");

    app.post("/login", login);
    app.post("/register", register);
    app.post("/refresh-token", refreshToken);
    app.get(
      "/api/fundamental/erm",
      // authenticateJWT,
      controller.GetERMValuation
    );

    app.listen(port, hostName as string, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  }
};

startServer();
