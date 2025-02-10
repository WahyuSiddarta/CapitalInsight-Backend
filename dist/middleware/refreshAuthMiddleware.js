"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRefreshJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const refreshSecretKey = process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";
const authenticateRefreshJWT = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (token) {
        jsonwebtoken_1.default.verify(token, refreshSecretKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    }
    else {
        res.sendStatus(401);
    }
};
exports.authenticateRefreshJWT = authenticateRefreshJWT;
