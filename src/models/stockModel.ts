import pool from "../db/postgres";

interface StockTicker {
  ticker: string;
}

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
}

interface StockHistoricalData {
  id: number;
  ticker: string;
  updated_at: Date;
  year: string;
}

export class StockModel {
  static async getStockTickers(): Promise<StockTicker[]> {
    const client = await pool.connect(); // Acquire a connection from the pool
    try {
      const res = await client.query(
        "SELECT ticker FROM t_stock_financial_information"
      );
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
        "SELECT * FROM t_stock_financial_information WHERE ticker = $1",
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

  static async getStockHistoricalDataByTicker(
    ticker: string
  ): Promise<StockHistoricalData[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM t_stock_historical WHERE ticker = $1",
        [ticker]
      );
      return res.rows;
    } catch (err) {
      console.error(
        `Error fetching historical data for ticker ${ticker}:`,
        err
      );
      throw err;
    } finally {
      client.release();
    }
  }

  static async getStockHistoricalDataByYear(
    year: string
  ): Promise<StockHistoricalData[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM t_stock_historical WHERE year = $1",
        [year]
      );
      return res.rows;
    } catch (err) {
      console.error(`Error fetching historical data for year ${year}:`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async upsertStockFinancialInformation(
    data: StockFinancialData
  ): Promise<void> {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO t_stock_financial_information (
          ticker, net_income, dividen_ttm, beta, total_equity, roe, 
          outstanding_share, current_price, price_at_start_year, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (ticker)
        DO UPDATE SET 
          net_income = EXCLUDED.net_income,
          dividen_ttm = EXCLUDED.dividen_ttm,
          beta = EXCLUDED.beta,
          total_equity = EXCLUDED.total_equity,
          roe = EXCLUDED.roe,
          outstanding_share = EXCLUDED.outstanding_share,
          current_price = EXCLUDED.current_price,
          price_at_start_year = EXCLUDED.price_at_start_year,
          updated_at = EXCLUDED.updated_at
      `;
      const values = [
        data.ticker,
        data.net_income,
        data.dividen_ttm,
        data.beta,
        data.total_equity,
        data.roe,
        data.outstanding_share,
        data.current_price,
        data.price_at_start_year,
        data.updated_at,
      ];
      console.log("values", values);
      await client.query(query, values);
    } catch (err) {
      console.error(
        `Error upserting stock financial information for ticker ${data.ticker}:`,
        err
      );
      throw err;
    } finally {
      client.release();
    }
  }
}
