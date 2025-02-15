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
exports.refreshToken = exports.register = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = require("../models/userModel");
const tokenHelper_1 = require("../helpers/tokenHelper");
const secretKey = process.env.JWT_SECRET || "your_secret_key";
const refreshSecretKey = process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";
const pepper = process.env.PEPPER || "your_pepper";
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userModel_1.UserModel.findByEmail(email);
        if (user &&
            bcrypt_1.default.compareSync(password + user.salt + pepper, user.password)) {
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, secretKey, {
                expiresIn: "1h",
            });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, refreshSecretKey, { expiresIn: "7d" });
            res.json({ token, refreshToken });
        }
        else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const salt = bcrypt_1.default.genSaltSync(10);
    const hashedPassword = bcrypt_1.default.hashSync(password + salt + pepper, 10);
    try {
        yield userModel_1.UserModel.create({
            email,
            password: hashedPassword,
            salt,
        });
        const user = yield userModel_1.UserModel.findByEmail(email);
        if (!user) {
            res.status(201).json({ message: "User registered successfully" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, secretKey, {
            expiresIn: "1h",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, refreshSecretKey, { expiresIn: "7d" });
        res
            .status(201)
            .json({ message: "User registered successfully", token, refreshToken });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.register = register;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        res.sendStatus(401);
        return;
    }
    const decoded = (0, tokenHelper_1.verifyRefreshToken)(token);
    if (!decoded) {
        res.sendStatus(403);
        return;
    }
    const { id, email } = decoded;
    const newToken = jsonwebtoken_1.default.sign({ id, email }, secretKey, { expiresIn: "1h" });
    res.json({ token: newToken });
});
exports.refreshToken = refreshToken;
