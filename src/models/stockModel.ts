import pool from "../db/postgres";

interface StockTicker {
  ticker: string;
}

export interface StockFinancialData {
  ticker: string;
  updated_at: Date;
  currentPERatioTTM: string | null;
  ihsgPERatioTTMMedian: string | null;
  earningsYieldTTM: string | null;
  currentPriceToSalesTTM: string | null;
  currentPriceToBookValue: string | null;
  currentPriceToCashflowTTM: string | null;
  currentPriceToFreeCashflowTTM: string | null;
  pegRatio: string | null;
  pegRatio3yr: string | null;
  currentEPSAnnualised: string | null;
  revenuePerShareTTM: string | null;
  cashPerShareQuarter: string | null;
  currentBookValuePerShare: string | null;
  freeCashflowPerShareTTM: string | null;
  currentRatioQuarter: string | null;
  quickRatioQuarter: string | null;
  debtToEquityRatioQuarter: string | null;
  ltDebtToEquityQuarter: string | null;
  totalLiabilitiesToEquityQuarter: string | null;
  totalDebtToTotalAssetsQuarter: string | null;
  financialLeverageQuarter: string | null;
  interestCoverageTTM: string | null;
  freeCashFlowQuarter: string | null;
  returnOnAssetsTTM: string | null;
  returnOnEquityTTM: string | null;
  returnOnCapitalEmployedTTM: string | null;
  returnOnInvestedCapitalTTM: string | null;
  daysSalesOutstandingQuarter: string | null;
  daysInventoryQuarter: string | null;
  daysPayablesOutstandingQuarter: string | null;
  cashConversionCycleQuarter: string | null;
  receivablesTurnoverQuarter: string | null;
  assetTurnoverTTM: string | null;
  inventoryTurnoverTTM: string | null;

  grossProfitMarginQuarter: string | null;
  operatingProfitMarginQuarter: string | null;
  netProfitMarginQuarter: string | null;
  revenueQuarterYoYGrowth: string | null;
  grossProfitQuarterYoYGrowth: string | null;
  netIncomeQuarterYoYGrowth: string | null;
  marketCap: string | null;
  enterpriseValue: string | null;
  currentShareOutstanding: string | null;
  dividendTTM: string | null;
  payoutRatio: string | null;
  dividendYield: string | null;
  latestDividendExDate: string | null;

  revenueTTM: string | null;
  grossProfitTTM: string | null;
  ebitdaTTM: string | null;
  netIncomeTTM: string | null;
  cashQuarter: string | null;
  totalAssetsQuarter: string | null;
  totalLiabilitiesQuarter: string | null;
  workingCapitalQuarter: string | null;
  totalEquity: string | null;
  longTermDebtQuarter: string | null;
  shortTermDebtQuarter: string | null;
  totalDebtQuarter: string | null;
  netDebtQuarter: string | null;
  cashFromOperationsTTM: string | null;
  cashFromInvestingTTM: string | null;
  cashFromFinancingTTM: string | null;
  capitalExpenditureTTM: string | null;
  freeCashFlowTTM: string | null;
  oneWeekPriceReturns: string | null;
  threeMonthPriceReturns: string | null;
  oneMonthPriceReturns: string | null;
  sixMonthPriceReturns: string | null;
  oneYearPriceReturns: string | null;
  threeYearPriceReturns: string | null;
  fiveYearPriceReturns: string | null;
  tenYearPriceReturns: string | null;
  yearToDatePriceReturns: string | null;
  fiftyTwoWeekHigh: string | null;
  fiftyTwoWeekLow: string | null;
}

export class StockModel {
  static async getStockTickers(): Promise<StockTicker[]> {
    const client = await pool.connect(); // Acquire a connection from the pool
    try {
      const res = await client.query("SELECT ticker FROM t_stock_financial");
      return res.rows.map((row) => ({
        ticker: row.ticker,
      }));
    } catch (err) {
      console.error("Error fetching stock tickers:", err);
      throw err;
    } finally {
      client.release(); // Release the connection back to the pool
    }
  }

  static async getStockInformationByTicker(
    ticker: string
  ): Promise<StockFinancialData | null> {
    const client = await pool.connect(); // Acquire a connection from the pool
    try {
      const res = await client.query(
        "SELECT * FROM t_stock_financial WHERE ticker = $1",
        [ticker]
      );
      return res.rows[0] || null;
    } catch (err) {
      console.error(
        `Error fetching stock information for ticker ${ticker}:`,
        err
      );
      throw err;
    } finally {
      client.release(); // Release the connection back to the pool
    }
  }
}
