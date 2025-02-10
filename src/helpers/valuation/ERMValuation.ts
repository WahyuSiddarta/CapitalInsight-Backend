import { StockFinancialData } from "../../models/stockModel";
import { percentToDecimal } from "../format";
import BigNumber from "bignumber.js";

export class ERMValuation {
  private stockData: StockFinancialData;
  private costOfEquity: BigNumber;

  constructor(stockData: StockFinancialData) {
    this.stockData = stockData;
    this.costOfEquity = new BigNumber(0);
  }

  public calculateCostOfEquity(
    risk_free_rate: number,
    market_return: number
  ): this {
    const { beta } = this.stockData;
    const equityRiskPremium = market_return - risk_free_rate;
    this.costOfEquity = new BigNumber(
      risk_free_rate + beta * equityRiskPremium
    );

    return this;
  }

  public calculateFairValue(): BigNumber {
    const costOfEquity = percentToDecimal(Number(this.costOfEquity));
    const BVPS = new BigNumber(
      this.stockData.total_equity / this.stockData.outstanding_share
    );
    const excessReturn = new BigNumber(percentToDecimal(this.stockData.roe))
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
      NewBVPS = NewBVPS.multipliedBy(
        percentToDecimal(i > 3 ? 0.05 : this.stockData.roe)
      ).plus(NewBVPS);

      const NewExcessReturn = new BigNumber(
        percentToDecimal(this.stockData.roe)
      )
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
    console.log(
      "EPS:",
      this.stockData.net_income / this.stockData.outstanding_share
    );

    return fairValue; // Replace with actual calculation logic
  }

  public getCostOfEquity(): number {
    return this.costOfEquity.toNumber();
  }
}
