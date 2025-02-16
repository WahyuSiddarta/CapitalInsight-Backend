"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomValuation = void 0;
const format_1 = require("../format");
class CustomValuation {
    constructor() {
        this.minNetIncome = 1000000;
        this.maxNetIncome = 20000000;
    }
    calculateConviction(conviction) {
        const maxPE = 35;
        const minPE = 20;
        const minConviction = 80;
        const maxConviction = 99;
        const convictionRate = (maxPE - minPE) / (maxConviction - minConviction);
        return (conviction - minConviction) * convictionRate + minPE;
    }
    calculateDiscountedStability(pe, stability) {
        const discountedFactor = 1;
        const maxStability = 99;
        const deltaStability = maxStability - stability;
        return pe * (0, format_1.percentToDecimal)(1 - deltaStability * discountedFactor);
    }
    calculateDiscountedReturn(pe, rateOfReturn) {
        const discountedFactor = 2;
        const minRateOfReturn = 20;
        if (rateOfReturn > minRateOfReturn) {
            return pe;
        }
        const deltaRateOfReturn = minRateOfReturn - rateOfReturn;
        return pe * (0, format_1.percentToDecimal)(1 - deltaRateOfReturn * discountedFactor);
    }
    calculateDiscountedGrowth(pe, growth) {
        const discountedFactor = 2;
        const minGrowth = 20;
        if (growth > minGrowth) {
            return pe;
        }
        const deltaGrowth = minGrowth - growth;
        return pe * (0, format_1.percentToDecimal)(1 - deltaGrowth * discountedFactor);
    }
    calculateDiscountedDividen(pe, dividen) {
        const discountedFactor = 0.3;
        const minDividen = 60;
        if (dividen > minDividen) {
            return pe;
        }
        const deltaDividen = minDividen - dividen;
        return pe * (0, format_1.percentToDecimal)(1 - deltaDividen * discountedFactor);
    }
    calculateDiscountedLeverage(pe, leverage) {
        const discountedFactor = 0.3;
        const maxLeverage = 30;
        if (leverage < maxLeverage) {
            return pe;
        }
        const deltaLeverage = leverage - maxLeverage;
        return pe * (0, format_1.percentToDecimal)(1 - deltaLeverage * discountedFactor);
    }
    calculateDiscountedSmallCap(pe, netIncome) {
        const minDisc = 10;
        const maxDisc = 20;
        const deltaDisc = maxDisc - minDisc;
        const deltaIncome = this.maxNetIncome - this.minNetIncome;
        const discountedFactor = deltaDisc / deltaIncome;
        const calculatedIncome = netIncome - this.minNetIncome;
        const discountedRate = calculatedIncome * discountedFactor + minDisc;
        return pe * (0, format_1.percentToDecimal)(1 - discountedRate);
    }
    calculateDiscountedLargeCap(pe, market_share) {
        const discountedFactor = 0.3;
        const minMarketShare = 20;
        if (market_share > minMarketShare) {
            return pe;
        }
        const deltaMarketShare = minMarketShare - market_share;
        return pe * (0, format_1.percentToDecimal)(1 - deltaMarketShare * discountedFactor);
    }
    calculateDiscountedAsset(BVPS, discounted_rate) {
        return BVPS * (0, format_1.percentToDecimal)(1 - discounted_rate);
    }
    calculateFairValue(BVPS, EPS, discounted_asset, user_conviction, stability, growth_rate, ROE, dividen, market_share, net_income, leverage) {
        if (net_income < this.minNetIncome) {
            return 0;
        }
        let pe = this.calculateConviction(user_conviction);
        pe = this.calculateDiscountedStability(pe, stability);
        pe = this.calculateDiscountedReturn(pe, ROE);
        pe = this.calculateDiscountedGrowth(pe, growth_rate);
        pe = this.calculateDiscountedDividen(pe, dividen);
        pe = this.calculateDiscountedLeverage(pe, leverage);
        if (net_income > this.minNetIncome) {
            pe = this.calculateDiscountedLargeCap(pe, market_share);
        }
        else {
            pe = this.calculateDiscountedSmallCap(pe, net_income);
        }
        let futureValue = EPS * pe;
        let todayValue = this.calculateDiscountedAsset(BVPS, discounted_asset);
        return todayValue + futureValue;
    }
}
exports.CustomValuation = CustomValuation;
