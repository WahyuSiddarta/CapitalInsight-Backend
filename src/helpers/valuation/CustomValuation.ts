import logger from "../../logger";
import { percentToDecimal } from "../format";

export class CustomValuation {
  private minNetIncome = 1000000;
  private maxNetIncome = 20000000;

  public calculateConviction(conviction: number): number {
    logger.info("conviction ", conviction);
    const maxPE = 35;
    const minPE = 20;
    const minConviction = 80;
    const maxConviction = 99;
    const convictionRate = (maxPE - minPE) / (maxConviction - minConviction);
    logger.info("convictionRate ", convictionRate);
    return (conviction - minConviction) * convictionRate + minPE;
  }

  private calculateDiscountedStability(pe: number, stability: number): number {
    const discountedFactor = 1;
    const maxStability = 99;
    const deltaStability = maxStability - stability;
    return pe * (1 - percentToDecimal(deltaStability * discountedFactor));
  }

  private calculateDiscountedReturn(pe: number, rateOfReturn: number): number {
    const discountedFactor = 2;
    const minRateOfReturn = 20;
    if (rateOfReturn > minRateOfReturn) {
      return pe;
    }
    const deltaRateOfReturn = minRateOfReturn - rateOfReturn;
    return pe * (1 - percentToDecimal(deltaRateOfReturn * discountedFactor));
  }

  private calculateDiscountedGrowth(pe: number, growth: number): number {
    const discountedFactor = 2;
    const minGrowth = 20;
    if (growth > minGrowth) {
      return pe;
    }
    const deltaGrowth = minGrowth - growth;
    return pe * (1 - percentToDecimal(deltaGrowth * discountedFactor));
  }

  private calculateDiscountedDividen(pe: number, dividen: number): number {
    const discountedFactor = 0.3;
    const minDividen = 60;
    if (dividen > minDividen) {
      return pe;
    }
    const deltaDividen = minDividen - dividen;
    return pe * (1 - percentToDecimal(deltaDividen * discountedFactor));
  }

  private calculateDiscountedLeverage(pe: number, leverage: number): number {
    const discountedFactor = 0.3;
    const maxLeverage = 30;
    const leverageConverted = (1 / leverage) * 100;
    if (leverageConverted < maxLeverage) {
      return pe;
    }
    const deltaLeverage = leverageConverted - maxLeverage;
    return pe * (1 - percentToDecimal(deltaLeverage * discountedFactor));
  }

  private calculateDiscountedSmallCap(pe: number, netIncome: number): number {
    const minDisc = 10;
    const maxDisc = 20;
    const deltaDisc = maxDisc - minDisc;
    const deltaIncome = this.maxNetIncome - this.minNetIncome;
    const discountedFactor = deltaDisc / deltaIncome;
    const calculatedIncome = netIncome - this.minNetIncome;
    const discountedRate = calculatedIncome * discountedFactor + minDisc;
    return pe * (1 - percentToDecimal(discountedRate));
  }

  private calculateDiscountedLargeCap(
    pe: number,
    market_share: number
  ): number {
    const discountedFactor = 0.3;
    const minMarketShare = 20;
    if (market_share > minMarketShare) {
      return pe;
    }
    const deltaMarketShare = minMarketShare - market_share;
    return pe * (1 - percentToDecimal(deltaMarketShare * discountedFactor));
  }

  private calculateDiscountedAsset(
    BVPS: number,
    discounted_rate: number
  ): number {
    return BVPS * (1 - percentToDecimal(discounted_rate));
  }

  public calculateFairValue(
    BVPS: number,
    EPS: number,
    discounted_asset: number,
    user_conviction: number,
    stability: number,
    growth_rate: number,
    ROE: number,
    dividen: number,
    market_share: number,
    net_income: number,
    leverage: number
  ): number {
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
    } else {
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
