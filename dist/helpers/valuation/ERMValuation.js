"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERMValuation = void 0;
const format_1 = require("../format");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
class ERMValuation {
    constructor(stockData) {
        this.stockData = stockData;
        this.costOfEquity = new bignumber_js_1.default(0);
    }
    calculateCostOfEquity(risk_free_rate, market_return) {
        const { beta } = this.stockData;
        const equityRiskPremium = market_return - risk_free_rate;
        this.costOfEquity = new bignumber_js_1.default(risk_free_rate + beta * equityRiskPremium);
        return this;
    }
    calculateFairValue() {
        const costOfEquity = (0, format_1.percentToDecimal)(Number(this.costOfEquity));
        const BVPS = new bignumber_js_1.default(this.stockData.total_equity / this.stockData.outstanding_share);
        const excessReturn = new bignumber_js_1.default((0, format_1.percentToDecimal)(this.stockData.roe))
            .minus(Number(costOfEquity))
            .multipliedBy(BVPS);
        let fairValue = excessReturn.dividedBy(1 + costOfEquity);
        let NewBVPS = BVPS;
        for (let i = 0; i < 9; i++) {
            let newRoe = this.stockData.roe;
            if (i > 3) {
                // decay 2% rate until stable value of 10%
                newRoe = Math.min(0.1, newRoe - i * 0.02);
            }
            NewBVPS = NewBVPS.multipliedBy((0, format_1.percentToDecimal)(i > 3 ? 0.05 : this.stockData.roe)).plus(NewBVPS);
            const NewExcessReturn = new bignumber_js_1.default((0, format_1.percentToDecimal)(this.stockData.roe))
                .minus(Number(costOfEquity))
                .multipliedBy(NewBVPS);
            const newFairValue = NewExcessReturn.dividedBy(1 + costOfEquity);
            fairValue = fairValue.plus(newFairValue);
        }
        fairValue = fairValue.plus(BVPS);
        // Console log all variables
        console.log(this.stockData.ticker);
        console.log("roe:", this.stockData.roe);
        console.log("beta:", this.stockData.beta);
        console.log("costOfEquity:", costOfEquity.toString());
        console.log("BVPS:", BVPS.toString());
        console.log("excessReturn:", excessReturn.toString());
        console.log("fairValue:", fairValue.toString());
        console.log("EPS:", this.stockData.net_income / this.stockData.outstanding_share);
        return fairValue; // Replace with actual calculation logic
    }
    getCostOfEquity() {
        return this.costOfEquity.toNumber();
    }
}
exports.ERMValuation = ERMValuation;
