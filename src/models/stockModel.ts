import pool from "../db/postgres";

interface StockTicker {
  ticker: string;
  industri: string | null;
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
      const res = await client.query(
        "SELECT a.ticker, (SELECT industri FROM m_ticker_target b WHERE a.ticker = b.ticker) as industri FROM t_stock_financial a"
      );
      return res.rows.map((row) => ({
        ticker: row.ticker,
        industri: row.industri,
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
      if (res.rows.length === 0) {
        return null;
      }

      const row = res.rows[0];
      const stockData: StockFinancialData = {
        ticker: row.ticker,
        updated_at: row.updated_at,
        currentPERatioTTM: row.currentperatiottm,
        ihsgPERatioTTMMedian: row.ihsgperatiottmmedian,
        earningsYieldTTM: row.earningsyieldttm,
        currentPriceToSalesTTM: row.currentpricetosalesttm,
        currentPriceToBookValue: row.currentpricetobookvalue,
        currentPriceToCashflowTTM: row.currentpricetocashflowttm,
        currentPriceToFreeCashflowTTM: row.currentpricetofreecashflowttm,
        pegRatio: row.pegratio,
        pegRatio3yr: row.pegratio3yr,
        currentEPSAnnualised: row.currentepsannualised,
        revenuePerShareTTM: row.revenuepersharettm,
        cashPerShareQuarter: row.cashpersharequarter,
        currentBookValuePerShare: row.currentbookvaluepershare,
        freeCashflowPerShareTTM: row.freecashflowpersharettm,
        currentRatioQuarter: row.currentratioquarter,
        quickRatioQuarter: row.quickratioquarter,
        debtToEquityRatioQuarter: row.debttoequityratioquarter,
        ltDebtToEquityQuarter: row.ltdebttoequityquarter,
        totalLiabilitiesToEquityQuarter: row.totalliabilitiestoequityquarter,
        totalDebtToTotalAssetsQuarter: row.totaldebtototalassetsquarter,
        financialLeverageQuarter: row.financialleveragequarter,
        interestCoverageTTM: row.interestcoveragettm,
        freeCashFlowQuarter: row.freecashflowquarter,
        returnOnAssetsTTM: row.returnonassetsttm,
        returnOnEquityTTM: row.returnonequityttm,
        returnOnCapitalEmployedTTM: row.returnoncapitalemployedttm,
        returnOnInvestedCapitalTTM: row.returnoninvestedcapitalttm,
        daysSalesOutstandingQuarter: row.dayssalesoutstandingquarter,
        daysInventoryQuarter: row.daysinventoryquarter,
        daysPayablesOutstandingQuarter: row.dayspayablesoutstandingquarter,
        cashConversionCycleQuarter: row.cashconversioncyclequarter,
        receivablesTurnoverQuarter: row.receivablesturnoverquarter,
        assetTurnoverTTM: row.assetturnoverttm,
        inventoryTurnoverTTM: row.inventoryturnoverttm,
        grossProfitMarginQuarter: row.grossprofitmarginquarter,
        operatingProfitMarginQuarter: row.operatingprofitmarginquarter,
        netProfitMarginQuarter: row.netprofitmarginquarter,
        revenueQuarterYoYGrowth: row.revenuequarteryoygrowth,
        grossProfitQuarterYoYGrowth: row.grossprofitquarteryoygrowth,
        netIncomeQuarterYoYGrowth: row.netincomequarteryoygrowth,
        marketCap: row.marketcap,
        enterpriseValue: row.enterprisevalue,
        currentShareOutstanding: row.currentshareoutstanding,
        dividendTTM: row.dividendttm,
        payoutRatio: row.payoutratio,
        dividendYield: row.dividendyield,
        latestDividendExDate: row.latestdividendexdate,
        revenueTTM: row.revenuettm,
        grossProfitTTM: row.grossprofittm,
        ebitdaTTM: row.ebitdattm,
        netIncomeTTM: row.netincomettm,
        cashQuarter: row.cashquarter,
        totalAssetsQuarter: row.totalassetsquarter,
        totalLiabilitiesQuarter: row.totalliabilitiesquarter,
        workingCapitalQuarter: row.workingcapitalquarter,
        totalEquity: row.totalequity,
        longTermDebtQuarter: row.longtermdebtquarter,
        shortTermDebtQuarter: row.shorttermdebtquarter,
        totalDebtQuarter: row.totaldebtquarter,
        netDebtQuarter: row.netdebtquarter,
        cashFromOperationsTTM: row.cashfromoperationsttm,
        cashFromInvestingTTM: row.cashfrominvestingttm,
        cashFromFinancingTTM: row.cashfromfinancingttm,
        capitalExpenditureTTM: row.capitalexpenditurettm,
        freeCashFlowTTM: row.freecashflowttm,
        oneWeekPriceReturns: row.oneweekpricereturns,
        threeMonthPriceReturns: row.threemonthpricereturns,
        oneMonthPriceReturns: row.onemonthpricereturns,
        sixMonthPriceReturns: row.sixmonthpricereturns,
        oneYearPriceReturns: row.oneyearpricereturns,
        threeYearPriceReturns: row.threeyearpricereturns,
        fiveYearPriceReturns: row.fiveyearpricereturns,
        tenYearPriceReturns: row.tenyearpricereturns,
        yearToDatePriceReturns: row.yeartodatepricereturns,
        fiftyTwoWeekHigh: row.fiftytwoweekhigh,
        fiftyTwoWeekLow: row.fiftytwoweeklow,
      };

      return stockData;
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
