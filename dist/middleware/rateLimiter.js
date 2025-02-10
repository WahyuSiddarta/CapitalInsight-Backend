"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customApiLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Default rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
});
const customApiLimiter = (options) => (0, express_rate_limit_1.default)({
    windowMs: options.windowMs || 15 * 60 * 1000, // default 15 minutes
    max: options.max || 100, // default 100 requests per windowMs
    message: options.message ||
        "Too many requests from this IP, please try again later",
});
exports.customApiLimiter = customApiLimiter;
