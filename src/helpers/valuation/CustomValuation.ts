import { percentToDecimal } from "../format";

export class CustomValuation {
  private minNetIncome = 1000000;
  private maxNetIncome = 20000000;

  public calculateConviction(conviction: number): number {
    const maxPE = 35;
    const minPE = 20;
    const minConviction = 80;
    const maxConviction = 99;
    const convictionRate = (maxPE - minPE) / (maxConviction - minConviction);
    return (conviction - minConviction) * convictionRate + minPE;
  }

  private calculateDiscountedStability(pe: number, stability: number): number {
    const discountedFactor = 1;
    const maxStability = 99;
    const deltaStability = maxStability - stability;
    return pe * percentToDecimal(1 - deltaStability * discountedFactor);
  }

  private calculateDiscountedReturn(pe: number, rateOfReturn: number): number {
    const discountedFactor = 2;
    const minRateOfReturn = 20;
    if (rateOfReturn > minRateOfReturn) {
      return pe;
    }
    const deltaRateOfReturn = minRateOfReturn - rateOfReturn;
    return pe * percentToDecimal(1 - deltaRateOfReturn * discountedFactor);
  }

  private calculateDiscountedGrowth(pe: number, growth: number): number {
    const discountedFactor = 2;
    const minGrowth = 20;
    if (growth > minGrowth) {
      return pe;
    }
    const deltaGrowth = minGrowth - growth;
    return pe * percentToDecimal(1 - deltaGrowth * discountedFactor);
  }

  private calculateDiscountedDividen(pe: number, dividen: number): number {
    const discountedFactor = 0.3;
    const minDividen = 60;
    if (dividen > minDividen) {
      return pe;
    }
    const deltaDividen = minDividen - dividen;
    return pe * percentToDecimal(1 - deltaDividen * discountedFactor);
  }

  private calculateDiscountedLeverage(pe: number, leverage: number): number {
    const discountedFactor = 0.3;
    const maxLeverage = 30;
    if (leverage < maxLeverage) {
      return pe;
    }
    const deltaLeverage = leverage - maxLeverage;
    return pe * percentToDecimal(1 - deltaLeverage * discountedFactor);
  }

  private calculateDiscountedSmallCap(pe: number, netIncome: number): number {
    const minDisc = 10;
    const maxDisc = 20;
    const deltaDisc = maxDisc - minDisc;
    const deltaIncome = this.maxNetIncome - this.minNetIncome;
    const discountedFactor = deltaDisc / deltaIncome;
    const calculatedIncome = netIncome - this.minNetIncome;
    const discountedRate = calculatedIncome * discountedFactor + minDisc;
    return pe * percentToDecimal(1 - discountedRate);
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
    return pe * percentToDecimal(1 - deltaMarketShare * discountedFactor);
  }

  private calculateDiscountedAsset(
    BVPS: number,
    discounted_rate: number
  ): number {
    return BVPS * percentToDecimal(1 - discounted_rate);
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
    let pe = this.calculateConviction(user_conviction);
    pe = this.calculateDiscountedStability(pe, stability);
    pe = this.calculateDiscountedReturn(pe, ROE);
    pe = this.calculateDiscountedGrowth(pe, growth_rate);
    pe = this.calculateDiscountedDividen(pe, dividen);
    pe = this.calculateDiscountedLeverage(pe, leverage);

    if (net_income > this.minNetIncome) {
      pe = this.calculateDiscountedLargeCap(pe, market_share);
    } else {
      pe = this.calculateDiscountedSmallCap(pe, net_income);
    }
    let futureValue = EPS * pe;
    let todayValue = this.calculateDiscountedAsset(BVPS, discounted_asset);
    return todayValue + futureValue;
  }
}
