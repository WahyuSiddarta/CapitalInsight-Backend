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
exports.GetERMValuation = exports.GetAllStockTicker = void 0;
const stockModel_1 = require("../models/stockModel");
const yahooStockModel_1 = require("../models/yahooStockModel");
const ERMValuation_1 = require("../helpers/valuation/ERMValuation");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const financialModel_1 = require("../models/financialModel");
const logger_1 = __importDefault(require("../logger"));
const GetAllStockTicker = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield stockModel_1.StockModel.getStockTickers();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.GetAllStockTicker = GetAllStockTicker;
const GetERMValuation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticker } = req.query;
    if (!ticker || typeof ticker !== "string") {
        return res.status(400).json({
            error: "Ticker query parameter is required and must be a string",
        });
    }
    const fullTicker = `${ticker}.JK`;
    try {
        let stockData = yield stockModel_1.StockModel.getStockInformationByTicker(fullTicker);
        if (!stockData) {
            stockData = yield yahooStockModel_1.YahooStockModel.getStockInformationByTicker(fullTicker);
            if (stockData) {
                try {
                    yield stockModel_1.StockModel.upsertStockFinancialInformation(stockData);
                }
                catch (error) {
                    logger_1.default.error(`Error upserting stock financial information for ticker ${fullTicker}: ${error}`);
                }
            }
        }
        if (!stockData) {
            return res
                .status(422)
                .json({ error: `Stock data not found for ticker: ${fullTicker}` });
        }
        const ermValuation = new ERMValuation_1.ERMValuation(stockData);
        const riskFree = yield financialModel_1.FinancialModel.getFinanceVarByKey("risk_free_rate");
        const idxFree = yield financialModel_1.FinancialModel.getFinanceVarByKey("stock_expected_return");
        if (!(riskFree === null || riskFree === void 0 ? void 0 : riskFree.financial_value) || !(idxFree === null || idxFree === void 0 ? void 0 : idxFree.financial_value)) {
            return res.status(500).json({ error: "Financial data not found" });
        }
        const result = ermValuation
            .calculateCostOfEquity(Number(riskFree.financial_value), Number(idxFree.financial_value))
            .calculateFairValue();
        return res.json({
            data: result.integerValue(bignumber_js_1.default.ROUND_FLOOR).toString(),
            ticker: stockData.ticker,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.GetERMValuation = GetERMValuation;
