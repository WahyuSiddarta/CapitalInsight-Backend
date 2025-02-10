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
                const res = yield client.query("SELECT ticker FROM t_stock_financial_information");
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
                const res = yield client.query("SELECT * FROM t_stock_financial_information WHERE ticker = $1", [ticker]);
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
    static getStockHistoricalDataByTicker(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield postgres_1.default.connect();
            try {
                const res = yield client.query("SELECT * FROM t_stock_historical WHERE ticker = $1", [ticker]);
                return res.rows;
            }
            catch (err) {
                console.error(`Error fetching historical data for ticker ${ticker}:`, err);
                throw err;
            }
            finally {
                client.release();
            }
        });
    }
    static getStockHistoricalDataByYear(year) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield postgres_1.default.connect();
            try {
                const res = yield client.query("SELECT * FROM t_stock_historical WHERE year = $1", [year]);
                return res.rows;
            }
            catch (err) {
                console.error(`Error fetching historical data for year ${year}:`, err);
                throw err;
            }
            finally {
                client.release();
            }
        });
    }
    static upsertStockFinancialInformation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield postgres_1.default.connect();
            try {
                const query = `
        INSERT INTO t_stock_financial_information (
          ticker, net_income, dividen_ttm, beta, total_equity, roe, 
          outstanding_share, current_price, price_at_start_year, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (ticker)
        DO UPDATE SET 
          net_income = EXCLUDED.net_income,
          dividen_ttm = EXCLUDED.dividen_ttm,
          beta = EXCLUDED.beta,
          total_equity = EXCLUDED.total_equity,
          roe = EXCLUDED.roe,
          outstanding_share = EXCLUDED.outstanding_share,
          current_price = EXCLUDED.current_price,
          price_at_start_year = EXCLUDED.price_at_start_year,
          updated_at = EXCLUDED.updated_at
      `;
                const values = [
                    data.ticker,
                    data.net_income,
                    data.dividen_ttm,
                    data.beta,
                    data.total_equity,
                    data.roe,
                    data.outstanding_share,
                    data.current_price,
                    data.price_at_start_year,
                    data.updated_at,
                ];
                console.log("values", values);
                yield client.query(query, values);
            }
            catch (err) {
                console.error(`Error upserting stock financial information for ticker ${data.ticker}:`, err);
                throw err;
            }
            finally {
                client.release();
            }
        });
    }
}
exports.StockModel = StockModel;
