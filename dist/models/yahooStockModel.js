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
exports.YahooStockModel = void 0;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const format_1 = require("../helpers/format");
const logger_1 = __importDefault(require("../logger"));
class YahooStockModel {
    static getStockInformationByTicker(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const quote = yield yahoo_finance2_1.default.quoteSummary(ticker, {
                    modules: [
                        "price",
                        "summaryDetail",
                        "defaultKeyStatistics",
                        "financialData",
                        "incomeStatementHistory",
                    ],
                });
                console.log(`Fetched stock information for ticker ${ticker}:`, quote);
                if (!quote) {
                    return null;
                }
                let stockData = {
                    ticker: ticker,
                    net_income: quote.incomeStatementHistory.incomeStatementHistory[0].netIncome /
                        1000000 || 0,
                    dividen_ttm: ((_a = quote.summaryDetail) === null || _a === void 0 ? void 0 : _a.dividendRate) || 0,
                    beta: ((_b = quote.summaryDetail) === null || _b === void 0 ? void 0 : _b.beta) || 0,
                    roe: ((_c = quote.financialData) === null || _c === void 0 ? void 0 : _c.returnOnEquity) * 100 || 0,
                    outstanding_share: Math.floor(((_d = quote.defaultKeyStatistics) === null || _d === void 0 ? void 0 : _d.sharesOutstanding) / 1000000) ||
                        0,
                    current_price: Math.floor((_e = quote.price) === null || _e === void 0 ? void 0 : _e.regularMarketPrice) || 0,
                    price_at_start_year: ((_f = quote.price) === null || _f === void 0 ? void 0 : _f.regularMarketOpen) || null,
                    updated_at: new Date(),
                    cost_of_equity: 0,
                    total_equity: 0,
                };
                stockData.total_equity = Math.floor(stockData.current_price +
                    stockData.net_income * (0, format_1.percentToDecimal)(stockData.roe));
                console.log(`Fetched stock information for ticker ${ticker}:`, stockData);
                return stockData;
            }
            catch (err) {
                console.error(`Error fetching stock information from Yahoo Finance for ticker ${ticker}:`, err);
                return null;
            }
        });
    }
    static getBetaByTicker(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quote = yield yahoo_finance2_1.default.quoteSummary(ticker, {
                    modules: ["summaryDetail"],
                });
                if (!quote || !quote.summaryDetail) {
                    return null;
                }
                return quote.summaryDetail.beta || null;
            }
            catch (err) {
                logger_1.default.error(`Error fetching beta from Yahoo Finance for ticker ${ticker}:`, err);
                return null;
            }
        });
    }
}
exports.YahooStockModel = YahooStockModel;
