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
exports.FinancialModel = void 0;
const postgres_1 = __importDefault(require("../db/postgres"));
class FinancialModel {
    static getFinanceVarByKey(financial_key) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield postgres_1.default.connect();
            try {
                const res = yield client.query("SELECT * FROM t_financial_variable WHERE financial_key = $1", [financial_key]);
                return res.rows[0] || null;
            }
            finally {
                client.release();
            }
        });
    }
}
exports.FinancialModel = FinancialModel;
