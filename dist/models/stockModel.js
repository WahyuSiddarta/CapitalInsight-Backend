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
exports.StockModel = void 0;
const postgres_1 = __importDefault(require("../db/postgres"));
class StockModel {
    static getStockTickers() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield postgres_1.default.connect(); // Acquire a connection from the pool
            try {
                const res = yield client.query("SELECT ticker FROM t_stock_financial");
                return res.rows.map((row) => ({
                    ticker: row.ticker,
                }));
            }
            catch (err) {
                console.error("Error fetching stock tickers:", err);
                throw err;
            }
            finally {
                client.release(); // Release the connection back to the pool
            }
        });
    }
    static getStockInformationByTicker(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield postgres_1.default.connect(); // Acquire a connection from the pool
            try {
                const res = yield client.query("SELECT * FROM t_stock_financial WHERE ticker = $1", [ticker]);
                return res.rows[0] || null;
            }
            catch (err) {
                console.error(`Error fetching stock information for ticker ${ticker}:`, err);
                throw err;
            }
            finally {
                client.release(); // Release the connection back to the pool
            }
        });
    }
}
exports.StockModel = StockModel;
