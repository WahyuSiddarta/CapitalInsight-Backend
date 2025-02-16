import logger from "../../logger";
import { percentToDecimal } from "../format";

export class ERMValuation {
  public calculateCostOfEquity(
    risk_free_rate: number, // 0-100
    market_return: number, // 0-100
    beta: number // 0-1
  ): number {
    const equityRiskPremium = market_return - risk_free_rate;
    return risk_free_rate + beta * equityRiskPremium; // 0-100
  }

  // COC is cost of capital, number between 0-100
  // BVPS is book value per share
  // ROE is return on equity, number between 0-100
  // TERMINAL_YEAR is the year at which the calculation stops, UI only support 5-10 Years
  // DECLINE_YEAR is the year at which the ROE starts to decline, if do not use decay, this value must be the same as TERMINAL_YEAR
  // FINAL_ROE is the final ROE value, number between 0-100, if do not use decay, this value must be the same as ROE
  public calculateFairValue(
    COC: number,
    BVPS: number,
    ROE: number,
    TERMINAL_YEAR: number,
    DECLINE_YEAR: number,
    FINAL_ROE: number
  ): { fairValue: number; costOfEquity: number } {
    // prepare data
    let decayRate = 0;
    if (TERMINAL_YEAR > DECLINE_YEAR) {
      const yearOperate = TERMINAL_YEAR - DECLINE_YEAR;
      decayRate = (ROE - FINAL_ROE) / yearOperate;
    }
    logger.info(`ERMValuation: decayRate ${decayRate}`);
    let final_roe = percentToDecimal(FINAL_ROE);
    logger.info(`ERMValuation: FINAL_ROE ${FINAL_ROE}`);
    const costOfEquity = percentToDecimal(COC);
    logger.info(`ERMValuation: COC ${COC}`);
    const initialExcessReturn = (percentToDecimal(ROE) - costOfEquity) * BVPS;
    logger.info(`ERMValuation: initialExcessReturn ${initialExcessReturn}`);

    let fairValue = initialExcessReturn / (1 + costOfEquity);
    let NewBVPS = BVPS;
    for (let i = 1; i <= TERMINAL_YEAR; i++) {
      let newRoe = ROE;
      if (i > DECLINE_YEAR) {
        // decay until final roe
        newRoe = Math.max(final_roe, ROE - i * decayRate);
      }
      NewBVPS = NewBVPS * (1 + percentToDecimal(newRoe));
      const NewExcessReturn =
        (percentToDecimal(newRoe) - costOfEquity) * NewBVPS;

      logger.info(`ERMValuation: NewExcessReturn ${i} : ${NewExcessReturn}`);
      const newFairValue = NewExcessReturn / (1 + costOfEquity);
      fairValue += newFairValue;
      logger.info(`ERMValuation: fairValue ${i} : ${fairValue}`);
    }

    logger.info(`ERMValuation: calculateFairValue ${BVPS}`);
    logger.info(`ERMValuation: calculateFairValue ${fairValue}`);
    fairValue += BVPS;

    return { fairValue, costOfEquity };
  }
}
