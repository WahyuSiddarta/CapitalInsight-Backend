"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const logger_1 = __importDefault(require("./logger")); // Import the logger
const app = (0, express_1.default)();
app.use(express_1.default.json()); // Middleware to parse JSON bodies
// Basic test route
app.get("/", (req, res) => {
    logger_1.default.info("Root route hit");
    res.send("Server is running");
});
// Use the authentication router
app.use("/api/auth", authRoutes_1.default);
// Use the JWT authentication middleware for protected routes
// app.use(authenticateJWT);
// Use the router
app.use("/api", (req, res, next) => {
    logger_1.default.info(`API route hit: ${req.path}`);
    next();
}, index_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
// app.use("/api/stock", stockRouter);
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error(`Error occurred: ${err.message}`);
    res.status(500).send("Something broke!");
});
exports.default = app;
