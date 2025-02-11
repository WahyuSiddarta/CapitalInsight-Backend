import { Request, Response } from "express";
import { StockModel } from "../models/stockModel";
import { YahooStockModel } from "../models/yahooStockModel";
import { ERMValuation } from "../helpers/valuation/ERMValuation";
import BigNumber from "bignumber.js";
import { FinancialModel } from "../models/financialModel";
import logger from "../logger";
import * as Yup from "yup";

export const GetAllStockTicker = async (req: Request, res: Response) => {
  try {
    const data = await StockModel.getStockTickers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const CalculateERMValuation = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ticker } = req.body;
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

    const financialVars = await FinancialModel.getFinanceVarsByKeys([
      "risk_free_rate",
      "stock_expected_return",
    ]);

    const riskFree = financialVars["risk_free_rate"];
    const idxFree = financialVars["stock_expected_return"];

    if (!riskFree || !idxFree) {
      return res.status(500).json({ error: "Financial data not found" });
    }

    const ermValuation = new ERMValuation(stockData);
    const result = ermValuation
      .calculateCostOfEquity(Number(riskFree), Number(idxFree))
      .calculateFairValue();

    return res.json({
      data: result.integerValue(BigNumber.ROUND_FLOOR).toString(),
      ticker: stockData.ticker,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

const customModelSchema = Yup.object().shape({
  ticker: Yup.string().required("Ticker is required and must be a string"),
  your_conviction: Yup.number()
    .min(0, "Your conviction must be between 0 and 100")
    .max(99, "Your conviction must be between 0 and 99")
    .required(
      "Your conviction is required and must be a number between 0 and 100"
    ),
  net_income: Yup.number().required(
    "Net income is required and must be a number"
  ),
  market_share: Yup.number()
    .min(0, "Market share must be between 0 and 100")
    .max(100, "Market share must be between 0 and 100")
    .when(
      "net_income",
      (net_income: any, schema: Yup.NumberSchema<number | undefined>) => {
        return net_income > 5000000
          ? schema.required(
              "Market share is required when net income is greater than 5,000,000"
            )
          : schema.notRequired();
      }
    ),
  discounted_asset: Yup.number()
    .min(0, "Discounted asset must be between 0 and 100")
    .max(100, "Discounted asset must be between 0 and 100")
    .required("Discounted asset is required and must be a number"),
  leverage: Yup.number()
    .required("Leverage is required and must be a number")
    .min(0, "Leverage must be between 0 and 100")
    .max(100, "Leverage must be between 0 and 100"),
});

export const CalculateCustomModel = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    await customModelSchema.validate(req.body, { abortEarly: false });
  } catch (validationError) {
    if (validationError instanceof Yup.ValidationError) {
      return res.status(400).json({ errors: validationError.errors });
    }
    return res.status(400).json({ error: "Validation failed" });
  }

  const { ticker } = req.body;
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

    const financialVars = await FinancialModel.getFinanceVarsByKeys([
      "risk_free_rate",
      "stock_expected_return",
    ]);

    const riskFree = financialVars["risk_free_rate"];
    const idxFree = financialVars["stock_expected_return"];

    if (!riskFree || !idxFree) {
      return res.status(500).json({ error: "Financial data not found" });
    }

    const ermValuation = new ERMValuation(stockData);
    const result = ermValuation
      .calculateCostOfEquity(Number(riskFree), Number(idxFree))
      .calculateFairValue();

    return res.json({
      data: result.integerValue(BigNumber.ROUND_FLOOR).toString(),
      ticker: stockData.ticker,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
