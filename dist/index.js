"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postgres_1 = __importDefault(require("./db/postgres"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const StockRoutes_1 = __importDefault(require("./routes/StockRoutes"));
const compression_1 = __importDefault(require("compression")); // Import the compression middleware
const middleware_1 = require("./middleware");
const cors_1 = __importDefault(require("cors"));
const logger_1 = __importDefault(require("./logger"));
const app = (0, express_1.default)();
const port = 3000;
const hostName = "0.0.0.0";
app.use(express_1.default.json()); // Ensure this is applied before routes
app.use((0, cors_1.default)({
    origin: "*", // Allow all origins (change this for security)
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization, x-no-compression",
}));
app.use("/api", middleware_1.apiLimiter); // Apply rate limiter to all /api routes
app.get("/api/ping", (req, res) => {
    res.send("pong");
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield postgres_1.default.connect();
        logger_1.default.info("Connected to the database");
        app.listen(port, hostName, () => {
            logger_1.default.info(`Server is running on port ${port}`);
            app.use("/api/public", authRoutes_1.default);
            // Apply JWT middleware and prefix /private to stockRoutes
            app.use("/api/private", middleware_1.authenticateJWT, StockRoutes_1.default);
            app.use((0, compression_1.default)({
                filter: (req, res) => {
                    if (req.headers["x-no-compression"]) {
                        return false; // Bypass compression if the client requests it
                    }
                    return compression_1.default.filter(req, res); // Use default filter
                },
            }));
        });
    }
    catch (err) {
        logger_1.default.error("Failed to connect to the database", err);
        process.exit(1);
    }
});
startServer();
