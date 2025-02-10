import yahooFinance from "yahoo-finance2";
import { percentToDecimal } from "../helpers/format";

export interface StockFinancialData {
  ticker: string;
  net_income: number;
  dividen_ttm: number;
  beta: number;
  total_equity: number;
  roe: number;
  outstanding_share: number;
  current_price: number;
  price_at_start_year: number | null;
  updated_at: Date;
  cost_of_equity: number;
}

export class YahooStockModel {
  static async getStockInformationByTicker(
    ticker: string
  ): Promise<StockFinancialData | null> {
    try {
      const quote: any = await yahooFinance.quoteSummary(ticker, {
        modules: [
          "price",
          "summaryDetail",
          "defaultKeyStatistics",
          "financialData",
          "incomeStatementHistory",
        ],
      });

      console.log(`Fetched stock information for ticker ${ticker}:`, quote);
      if (!quote) {
        return null;
      }

      let stockData: StockFinancialData = {
        ticker: ticker,
        net_income:
          quote.incomeStatementHistory.incomeStatementHistory[0].netIncome /
            1000000 || 0,
        dividen_ttm: quote.summaryDetail?.dividendRate || 0,
        beta: quote.summaryDetail?.beta || 0,
        roe: quote.financialData?.returnOnEquity * 100 || 0,
        outstanding_share:
          Math.floor(quote.defaultKeyStatistics?.sharesOutstanding / 1000000) ||
          0,
        current_price: Math.floor(quote.price?.regularMarketPrice) || 0,
        price_at_start_year: quote.price?.regularMarketOpen || null,
        updated_at: new Date(),
        cost_of_equity: 0,
        total_equity: 0,
      };

      stockData.total_equity = Math.floor(
        stockData.current_price +
          stockData.net_income * percentToDecimal(stockData.roe)
      );

      console.log(`Fetched stock information for ticker ${ticker}:`, stockData);
      return stockData;
    } catch (err) {
      console.error(
        `Error fetching stock information from Yahoo Finance for ticker ${ticker}:`,
        err
      );
      return null;
    }
  }
}
