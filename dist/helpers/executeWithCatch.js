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
exports.executeWithCatch = executeWithCatch;
const logger_1 = __importDefault(require("../logger"));
function executeWithCatch(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fn(); // Returns the result of the function when successful
        }
        catch (error) {
            logger_1.default.error(error); // Log error to file and display on scree
            return undefined; // Returns undefined if an error occurs
        }
    });
}
