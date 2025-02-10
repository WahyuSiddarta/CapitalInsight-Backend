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
const authController_1 = require("./controllers/authController");
const StockRoutes_1 = __importDefault(require("./routes/StockRoutes"));
const app = (0, express_1.default)();
const port = 3000;
const hostName = "0.0.0.0";
app.use(express_1.default.json());
app.get("/ping", (req, res) => {
    res.send("pong");
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield postgres_1.default.connect();
        console.log("Connected to the database");
        app.post("/api/login", authController_1.login);
        app.post("/api/register", authController_1.register);
        app.post("/api/refresh-token", authController_1.refreshToken);
        app.use(StockRoutes_1.default);
        app.listen(port, hostName, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (err) {
        console.error("Failed to connect to the database", err);
        process.exit(1);
    }
});
startServer();
