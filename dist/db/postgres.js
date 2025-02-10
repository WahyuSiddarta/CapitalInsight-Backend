"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../logger")); // Make sure to import your logger
dotenv_1.default.config();
const createPool = () => {
    return new pg_1.Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        min: 1, // minimum number of clients in the pool
        max: Number(process.env.DB_MAX_CLIENTS) || 10, // maximum number of clients in the pool
        idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 10000, // close idle clients after 10 seconds
        connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT) || 2000, // return an error after 2 seconds if connection could not be established
        allowExitOnIdle: false, // flag to prevent exiting on idle
    });
};
let pool = createPool();
pool.on("error", (err, client) => {
    logger_1.default.error("Unexpected error on idle client", err);
    process.exit(-1); // Exit the application if the database connection is terminated
});
exports.default = pool;
