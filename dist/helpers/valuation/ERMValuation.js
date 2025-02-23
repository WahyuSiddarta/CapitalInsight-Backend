"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERMValuation = void 0;
const logger_1 = __importDefault(require("../../logger"));
const format_1 = require("../format");
class ERMValuation {
    calculateCostOfEquity(risk_free_rate, // 0-100
    market_return, // 0-100
    beta // 0-1
    ) {
        const equityRiskPremium = market_return - risk_free_rate;
        return risk_free_rate + beta * equityRiskPremium; // 0-100
    }
    // COC is cost of capital, number between 0-100
    // BVPS is book value per share
    // ROE is return on equity, number between 0-100
    // TERMINAL_YEAR is the year at which the calculation stops, UI only support 5-10 Years
    // DECLINE_YEAR is the year at which the ROE starts to decline, if do not use decay, this value must be the same as TERMINAL_YEAR
    // FINAL_ROE is the final ROE value, number between 0-100, if do not use decay, this value must be the same as ROE
    calculateFairValue(COC, BVPS, ROE, TERMINAL_YEAR, DECLINE_YEAR, FINAL_ROE) {
        // prepare data
        let decayRate = 0;
        if (TERMINAL_YEAR > DECLINE_YEAR) {
            const yearOperate = TERMINAL_YEAR - DECLINE_YEAR;
            decayRate = (ROE - FINAL_ROE) / yearOperate;
        }
        logger_1.default.info(`ERMValuation: decayRate ${decayRate}`);
        let final_roe = (0, format_1.percentToDecimal)(FINAL_ROE);
        logger_1.default.info(`ERMValuation: FINAL_ROE ${FINAL_ROE}`);
        const costOfEquity = (0, format_1.percentToDecimal)(COC);
        logger_1.default.info(`ERMValuation: COC ${COC}`);
        const initialExcessReturn = ((0, format_1.percentToDecimal)(ROE) - costOfEquity) * BVPS;
        logger_1.default.info(`ERMValuation: initialExcessReturn ${initialExcessReturn}`);
        let fairValue = initialExcessReturn / (1 + costOfEquity);
        let NewBVPS = BVPS;
        for (let i = 1; i <= TERMINAL_YEAR; i++) {
            let newRoe = ROE;
            if (i > DECLINE_YEAR) {
                // decay until final roe
                newRoe = Math.max(final_roe, ROE - i * decayRate);
            }
            NewBVPS = NewBVPS * (1 + (0, format_1.percentToDecimal)(newRoe));
            const NewExcessReturn = ((0, format_1.percentToDecimal)(newRoe) - costOfEquity) * NewBVPS;
            logger_1.default.info(`ERMValuation: NewExcessReturn ${i} : ${NewExcessReturn}`);
            const newFairValue = NewExcessReturn / (1 + costOfEquity);
            fairValue += newFairValue;
            logger_1.default.info(`ERMValuation: fairValue ${i} : ${fairValue}`);
        }
        logger_1.default.info(`ERMValuation: calculateFairValue ${BVPS}`);
        logger_1.default.info(`ERMValuation: calculateFairValue ${fairValue}`);
        fairValue += BVPS;
        return { fairValue, costOfEquity };
    }
}
exports.ERMValuation = ERMValuation;
