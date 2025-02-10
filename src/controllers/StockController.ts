import { Request, Response } from "express";
import { StockModel } from "../models/stockModel";
import { YahooStockModel } from "../models/yahooStockModel";
import { ERMValuation } from "../helpers/valuation/ERMValuation";
import BigNumber from "bignumber.js";
import { FinancialModel } from "../models/financialModel";
import logger from "../logger";

export const GetAllStockTicker = async (req: Request, res: Response) => {
  try {
    const data = await StockModel.getStockTickers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const GetERMValuation = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ticker } = req.query;
  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({
      error: "Ticker query parameter is required and must be a string",
    });
  }

  const fullTicker = `${ticker}.JK`;

  try {
    let stockData = await StockModel.getStockInformationByTicker(fullTicker);

    if (!stockData) {
      stockData = await YahooStockModel.getStockInformationByTicker(fullTicker);
      if (stockData) {
        try {
          await StockModel.upsertStockFinancialInformation(stockData);
        } catch (error) {
          logger.error(
            `Error upserting stock financial information for ticker ${fullTicker}: ${error}`
          );
        }
      }
    }

    if (!stockData) {
      return res
        .status(422)
        .json({ error: `Stock data not found for ticker: ${fullTicker}` });
    }

    const ermValuation = new ERMValuation(stockData);
    const riskFree = await FinancialModel.getFinanceVarByKey("risk_free_rate");
    const idxFree = await FinancialModel.getFinanceVarByKey(
      "stock_expected_return"
    );

    if (!riskFree?.financial_value || !idxFree?.financial_value) {
      return res.status(500).json({ error: "Financial data not found" });
    }

    const result = ermValuation
      .calculateCostOfEquity(
        Number(riskFree.financial_value),
        Number(idxFree.financial_value)
      )
      .calculateFairValue();

    return res.json({
      data: result.integerValue(BigNumber.ROUND_FLOOR).toString(),
      ticker: stockData.ticker,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
