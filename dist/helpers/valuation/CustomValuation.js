"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomValuation = void 0;
const logger_1 = __importDefault(require("../../logger"));
const format_1 = require("../format");
class CustomValuation {
    constructor() {
        this.minNetIncome = 1000000;
        this.maxNetIncome = 20000000;
    }
    calculateConviction(conviction) {
        logger_1.default.info("conviction ", conviction);
        const maxPE = 35;
        const minPE = 20;
        const minConviction = 80;
        const maxConviction = 99;
        const convictionRate = (maxPE - minPE) / (maxConviction - minConviction);
        logger_1.default.info("convictionRate ", convictionRate);
        return (conviction - minConviction) * convictionRate + minPE;
    }
    calculateDiscountedStability(pe, stability) {
        const discountedFactor = 1;
        const maxStability = 99;
        const deltaStability = maxStability - stability;
        return pe * (1 - (0, format_1.percentToDecimal)(deltaStability * discountedFactor));
    }
    calculateDiscountedReturn(pe, rateOfReturn) {
        const discountedFactor = 2;
        const minRateOfReturn = 20;
        if (rateOfReturn > minRateOfReturn) {
            return pe;
        }
        const deltaRateOfReturn = minRateOfReturn - rateOfReturn;
        return pe * (1 - (0, format_1.percentToDecimal)(deltaRateOfReturn * discountedFactor));
    }
    calculateDiscountedGrowth(pe, growth) {
        const discountedFactor = 2;
        const minGrowth = 20;
        if (growth > minGrowth) {
            return pe;
        }
        const deltaGrowth = minGrowth - growth;
        return pe * (1 - (0, format_1.percentToDecimal)(deltaGrowth * discountedFactor));
    }
    calculateDiscountedDividen(pe, dividen) {
        const discountedFactor = 0.3;
        const minDividen = 60;
        if (dividen > minDividen) {
            return pe;
        }
        const deltaDividen = minDividen - dividen;
        return pe * (1 - (0, format_1.percentToDecimal)(deltaDividen * discountedFactor));
    }
    calculateDiscountedLeverage(pe, leverage) {
        const discountedFactor = 0.3;
        const maxLeverage = 30;
        const leverageConverted = (1 / leverage) * 100;
        if (leverageConverted < maxLeverage) {
            return pe;
        }
        const deltaLeverage = leverageConverted - maxLeverage;
        return pe * (1 - (0, format_1.percentToDecimal)(deltaLeverage * discountedFactor));
    }
    calculateDiscountedSmallCap(pe, netIncome) {
        const minDisc = 10;
        const maxDisc = 20;
        const deltaDisc = maxDisc - minDisc;
        const deltaIncome = this.maxNetIncome - this.minNetIncome;
        const discountedFactor = deltaDisc / deltaIncome;
        const calculatedIncome = netIncome - this.minNetIncome;
        const discountedRate = calculatedIncome * discountedFactor + minDisc;
        return pe * (1 - (0, format_1.percentToDecimal)(discountedRate));
    }
    calculateDiscountedLargeCap(pe, market_share) {
        const discountedFactor = 0.3;
        const minMarketShare = 20;
        if (market_share > minMarketShare) {
            return pe;
        }
        const deltaMarketShare = minMarketShare - market_share;
        return pe * (1 - (0, format_1.percentToDecimal)(deltaMarketShare * discountedFactor));
    }
    calculateDiscountedAsset(BVPS, discounted_rate) {
        return BVPS * (1 - (0, format_1.percentToDecimal)(discounted_rate));
    }
    calculateFairValue(BVPS, EPS, discounted_asset, user_conviction, stability, growth_rate, ROE, dividen, market_share, net_income, leverage) {
        if (net_income < this.minNetIncome) {
            return 0;
        }
        console.log("BVPS: ", BVPS);
        console.log("EPS: ", EPS);
        console.log("discounted_asset: ", discounted_asset);
        console.log("user_conviction: ", user_conviction);
        console.log("stability: ", stability);
        console.log("growth_rate: ", growth_rate);
        console.log("ROE: ", ROE);
        console.log("dividen: ", dividen);
        console.log("market_share: ", market_share);
        console.log("net_income: ", net_income);
        console.log("leverage: ", leverage);
        let pe = this.calculateConviction(user_conviction);
        console.log("1:", pe);
        pe = this.calculateDiscountedStability(pe, stability);
        console.log("2:", pe);
        pe = this.calculateDiscountedReturn(pe, ROE);
        console.log("3:", pe);
        pe = this.calculateDiscountedGrowth(pe, growth_rate);
        console.log("4:", pe);
        pe = this.calculateDiscountedDividen(pe, dividen);
        console.log("5:", pe);
        pe = this.calculateDiscountedLeverage(pe, leverage);
        console.log("6:", pe);
        if (net_income > this.minNetIncome) {
            pe = this.calculateDiscountedLargeCap(pe, market_share);
        }
        else {
            pe = this.calculateDiscountedSmallCap(pe, net_income);
        }
        console.log("7:", pe);
        let futureValue = EPS * pe;
        console.log("8:", futureValue);
        let todayValue = this.calculateDiscountedAsset(BVPS, discounted_asset);
        console.log("9:", todayValue);
        return todayValue + futureValue;
    }
}
exports.CustomValuation = CustomValuation;
