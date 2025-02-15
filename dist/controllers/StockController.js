"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.CalculateCustomModel = exports.CalculateERMValuation = exports.GetAllStockTicker = void 0;
const stockModel_1 = require("../models/stockModel");
const yahooStockModel_1 = require("../models/yahooStockModel");
const ERMValuation_1 = require("../helpers/valuation/ERMValuation");
const financialModel_1 = require("../models/financialModel");
const logger_1 = __importDefault(require("../logger"));
const Yup = __importStar(require("yup"));
const executeWithCatch_1 = require("../helpers/executeWithCatch");
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
const CalculateERMValuation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticker, terminal_year_params, beta_params, // optional // temporary required on UI
    bvps_params, // optional
    roe_params, // optional
    decline_year_params, // optional
    final_roe_params, // optional
     } = req.body;
    // required params validation
    if (!ticker || typeof ticker !== "string") {
        return res.status(400).json({
            error: "Ticker query parameter is required and must be a string",
        });
    }
    if (!terminal_year_params) {
        return res.status(400).json({
            error: "Terminal year is required",
        });
    }
    const terminal_year = Number(terminal_year_params);
    if (isNaN(terminal_year)) {
        return res.status(400).json({
            error: "Terminal year must be a number",
        });
    }
    // validate data from db
    const stockData = yield (0, executeWithCatch_1.executeWithCatch)(() => stockModel_1.StockModel.getStockInformationByTicker(ticker));
    if (!stockData) {
        return res
            .status(422)
            .json({ error: `Stock data not found for ticker: ${ticker}` });
    }
    let bvps = Number(stockData.currentBookValuePerShare);
    if (isNaN(bvps)) {
        return res.status(400).json({
            error: `Error on DB ticker ${ticker} : ${stockData.currentBookValuePerShare}`,
        });
    }
    let roe = Number(stockData.returnOnAssetsTTM);
    if (isNaN(roe)) {
        return res.status(400).json({
            error: `Error on DB ${ticker} : ${stockData.returnOnAssetsTTM}`,
        });
    }
    // temporary fetch beta from yahoo, beta should be collected by cron job
    let yahooBeta = yahooStockModel_1.YahooStockModel.getStockInformationByTicker(ticker + ".JK");
    if (!yahooBeta || isNaN(Number(yahooBeta))) {
        return res
            .status(422)
            .json({ error: `Beta not found for ticker: ${ticker}` });
    }
    let beta = Number(yahooBeta);
    // optional params validation
    const decline_year_num = Number(decline_year_params);
    if (!!decline_year_params && isNaN(decline_year_num)) {
        return res.status(400).json({
            error: "Decline year must be a number",
        });
    }
    const beta_num = Number(beta_params);
    if (!!beta_params && isNaN(beta_num)) {
        return res.status(400).json({
            error: "Beta must be a number",
        });
    }
    const bvps_num = Number(bvps_params);
    if (!!bvps_params && isNaN(bvps_num)) {
        return res.status(400).json({
            error: "BVPS must be a number",
        });
    }
    const roe_num = Number(roe_params);
    if (!!roe_params && isNaN(roe_num)) {
        return res.status(400).json({
            error: "ROE must be a number",
        });
    }
    if (!!roe_params && roe_num >= 0 && roe_num <= 100) {
        return res.status(400).json({
            error: "ROE must be between 0 and 100",
        });
    }
    const final_roe_num = Number(final_roe_params);
    if (!!final_roe_params && isNaN(final_roe_num)) {
        return res.status(400).json({
            error: "Final ROE must be a number",
        });
    }
    if (!!final_roe_params && final_roe_num >= 0 && final_roe_num <= 100) {
        return res.status(400).json({
            error: "Final ROE must be between 0 and 100",
        });
    }
    // if param is not provided, set it to terminal year
    let decline_year = decline_year_num;
    if (!!decline_year_params && !isNaN(decline_year)) {
        decline_year = Math.min(terminal_year, decline_year_num);
    }
    if (!!beta_params && beta_num > 0) {
        beta = beta_num;
    }
    if (!!bvps_params && bvps_num > 0) {
        bvps = bvps_num;
    }
    if (!!roe_params && roe_num > 0) {
        roe = roe_num;
    }
    let final_roe = roe; // default value, change this to use data from db
    if (!!final_roe_params && final_roe_num > 0) {
        final_roe = final_roe_num;
    }
    try {
        const financialVars = yield financialModel_1.FinancialModel.getFinanceVarsByKeys([
            "risk_free_rate",
            "stock_expected_return",
        ]);
        const riskFree = financialVars["risk_free_rate"];
        const idxFree = financialVars["stock_expected_return"];
        if (!riskFree || !idxFree) {
            logger_1.default.error(`Error getting global data : ${riskFree} ${idxFree}`);
            return res.status(500).json({ error: "Global data not found" });
        }
        const ermValuation = new ERMValuation_1.ERMValuation();
        const cost_of_equity = ermValuation.calculateCostOfEquity(Number(riskFree), Number(idxFree), beta);
        const fair_value = ermValuation.calculateFairValue(cost_of_equity, bvps, roe, terminal_year, decline_year, final_roe);
        return res.json({
            cost_of_equity,
            fair_value,
            ticker: ticker,
        });
    }
    catch (err) {
        logger_1.default.error(`Error calculating ERM valuation for ticker ${ticker}: ${err}`);
        res.status(500).json({ error: err.message });
    }
});
exports.CalculateERMValuation = CalculateERMValuation;
const customModelSchema = Yup.object().shape({
    ticker: Yup.string().required("Ticker is required and must be a string"),
    your_conviction: Yup.number()
        .min(0, "Your conviction must be between 0 and 100")
        .max(99, "Your conviction must be between 0 and 99")
        .required("Your conviction is required and must be a number between 0 and 100"),
    net_income: Yup.number().required("Net income is required and must be a number"),
    market_share: Yup.number()
        .min(0, "Market share must be between 0 and 100")
        .max(100, "Market share must be between 0 and 100")
        .when("net_income", (net_income, schema) => {
        return net_income > 5000000
            ? schema.required("Market share is required when net income is greater than 5,000,000")
            : schema.notRequired();
    }),
    discounted_asset: Yup.number()
        .min(0, "Discounted asset must be between 0 and 100")
        .max(100, "Discounted asset must be between 0 and 100")
        .required("Discounted asset is required and must be a number"),
    leverage: Yup.number()
        .required("Leverage is required and must be a number")
        .min(0, "Leverage must be between 0 and 100")
        .max(100, "Leverage must be between 0 and 100"),
});
const CalculateCustomModel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield customModelSchema.validate(req.body, { abortEarly: false });
    }
    catch (validationError) {
        if (validationError instanceof Yup.ValidationError) {
            return res.status(400).json({ errors: validationError.errors });
        }
        return res.status(400).json({ error: "Validation failed" });
    }
    const { ticker } = req.body;
    const fullTicker = `${ticker}.JK`;
    try {
        let stockData = yield stockModel_1.StockModel.getStockInformationByTicker(fullTicker);
        if (!stockData) {
            // stockData = await YahooStockModel.getStockInformationByTicker(fullTicker);
            // if (stockData) {
            //   try {
            //     await StockModel.upsertStockFinancialInformation(stockData);
            //   } catch (error) {
            //     logger.error(
            //       `Error upserting stock financial information for ticker ${fullTicker}: ${error}`
            //     );
            //   }
            // }
        }
        if (!stockData) {
            return res
                .status(422)
                .json({ error: `Stock data not found for ticker: ${fullTicker}` });
        }
        const financialVars = yield financialModel_1.FinancialModel.getFinanceVarsByKeys([
            "risk_free_rate",
            "stock_expected_return",
        ]);
        const riskFree = financialVars["risk_free_rate"];
        const idxFree = financialVars["stock_expected_return"];
        if (!riskFree || !idxFree) {
            return res.status(500).json({ error: "Financial data not found" });
        }
        return res.json({
            data: 0,
            ticker: ticker,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.CalculateCustomModel = CalculateCustomModel;
