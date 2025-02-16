import { Request, Response } from "express";
import { StockModel } from "../models/stockModel";
import { YahooStockModel } from "../models/yahooStockModel";
import { ERMValuation } from "../helpers/valuation/ERMValuation";
import { FinancialModel } from "../models/financialModel";
import logger from "../logger";
import * as Yup from "yup";
import { executeWithCatch } from "../helpers/executeWithCatch";
import { CustomValuation } from "../helpers/valuation/CustomValuation";
import { calculateEPS, convertToNumber } from "../helpers/format";

export const GetAllStockTicker = async (req: Request, res: Response) => {
  try {
    const data = await StockModel.getStockTickers();
    res.json(data);
  } catch (err) {
    logger.error(`Error fetching stock tickers: ${err}`);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const CalculateERMValuation = async (
  req: Request,
  res: Response
): Promise<any> => {
  const {
    ticker,
    terminal_year_params,
    beta_params, // optional // temporary required on UI
    bvps_params, // optional
    roe_params, // optional
    decline_year_params, // optional
    final_roe_params, // optional
  } = req.body;

  // required params validation
  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({
      error: "Ticker query parameter is required and must be a string",
    });
  }

  if (!terminal_year_params) {
    return res.status(400).json({
      error: "Terminal year is required",
    });
  }
  const terminal_year = Number(terminal_year_params);
  if (isNaN(terminal_year)) {
    return res.status(400).json({
      error: "Terminal year must be a number",
    });
  }

  // validate data from db
  const stockData = await executeWithCatch(() =>
    StockModel.getStockInformationByTicker(ticker)
  );
  if (!stockData) {
    return res
      .status(422)
      .json({ error: `Stock data not found for ticker: ${ticker}` });
  }

  let bvps = Number(stockData.currentBookValuePerShare);
  if (isNaN(bvps)) {
    return res.status(400).json({
      error: `Error on DB ticker ${ticker} : ${stockData.currentBookValuePerShare}`,
    });
  }

  let roe = Number(stockData.returnOnEquityTTM);
  if (isNaN(roe)) {
    return res.status(400).json({
      error: `Error on DB ${ticker} : ${stockData.returnOnEquityTTM}`,
    });
  }

  // temporary fetch beta from yahoo, beta should be collected by cron job
  let yahooBeta = await YahooStockModel.getBetaByTicker(ticker + ".JK");
  if (!yahooBeta || isNaN(Number(yahooBeta))) {
    return res
      .status(422)
      .json({ error: `Beta not found for ticker: ${ticker}` });
  }

  let beta = Number(yahooBeta);

  // optional params validation
  const decline_year_num = Number(decline_year_params);
  if (!!decline_year_params && isNaN(decline_year_num)) {
    return res.status(400).json({
      error: "Decline year must be a number",
    });
  }

  const beta_num = Number(beta_params);
  if (!!beta_params && isNaN(beta_num)) {
    return res.status(400).json({
      error: "Beta must be a number",
    });
  }

  const bvps_num = Number(bvps_params);
  if (!!bvps_params && isNaN(bvps_num)) {
    return res.status(400).json({
      error: "BVPS must be a number",
    });
  }

  const roe_num = Number(roe_params);
  if (!!roe_params && isNaN(roe_num)) {
    return res.status(400).json({
      error: "ROE must be a number",
    });
  }
  if (!!roe_params && roe_num >= 0 && roe_num <= 100) {
    return res.status(400).json({
      error: "ROE must be between 0 and 100",
    });
  }

  const final_roe_num = Number(final_roe_params);
  if (!!final_roe_params && isNaN(final_roe_num)) {
    return res.status(400).json({
      error: "Final ROE must be a number",
    });
  }

  if (!!final_roe_params && !(final_roe_num >= 0 && final_roe_num <= 100)) {
    return res.status(400).json({
      error: `Final ROE must be between 0 and 100 : ${final_roe_num}`,
    });
  }

  // if param is not provided, set it to terminal year
  let decline_year = decline_year_num;
  if (!!decline_year_params && !isNaN(decline_year)) {
    decline_year = Math.min(terminal_year, decline_year_num);
  }

  if (!!beta_params && beta_num > 0) {
    beta = beta_num;
  }

  if (!!bvps_params && bvps_num > 0) {
    bvps = bvps_num;
  }

  if (!!roe_params && roe_num > 0) {
    roe = roe_num;
  }

  let final_roe = roe; // default value, change this to use data from db
  if (!!final_roe_params && final_roe_num > 0) {
    final_roe = final_roe_num;
  }

  try {
    const financialVars = await FinancialModel.getFinanceVarsByKeys([
      "risk_free_rate",
      "stock_expected_return",
    ]);

    const riskFree = financialVars["risk_free_rate"];
    const idxFree = financialVars["stock_expected_return"];

    if (!riskFree || !idxFree) {
      logger.error(`Error getting global data : ${riskFree} ${idxFree}`);
      return res.status(500).json({ error: "Global data not found" });
    }

    const ermValuation = new ERMValuation();
    const cost_of_equity = ermValuation.calculateCostOfEquity(
      Number(riskFree),
      Number(idxFree),
      beta
    );

    const fair_value = ermValuation.calculateFairValue(
      cost_of_equity,
      bvps,
      roe,
      terminal_year,
      decline_year,
      final_roe
    );

    return res.json({
      data: fair_value,
      ticker: ticker,
    });
  } catch (err) {
    logger.error(
      `Error calculating ERM valuation for ticker ${ticker}: ${err}`
    );
    res.status(500).json({ error: (err as Error).message });
  }
};

const customModelSchema = Yup.object().shape({
  ticker: Yup.string().required("Ticker is required and must be a string"),
  user_conviction: Yup.number()
    .min(0, "Your conviction must be between 0 and 100")
    .max(99, "Your conviction must be between 0 and 99")
    .required(
      "Your conviction is required and must be a number between 0 and 100"
    ),
  net_income: Yup.string().required(
    "Net income is required and must be a number"
  ),
  market_share: Yup.number()
    .min(0, "Market share must be between 0 and 100")
    .max(100, "Market share must be between 0 and 100")
    .when(
      "net_income",
      (
        net_income: string | string[],
        schema: Yup.NumberSchema<number | undefined>
      ) => {
        const realNetIncome = convertToNumber(
          typeof net_income === "string" ? net_income : net_income[0]
        );
        return realNetIncome.isGreaterThan(5000000000000)
          ? schema.required(
              "Market share is required when net income is greater than 5,000,000,000,000"
            )
          : schema.notRequired();
      }
    ),
  discounted_asset: Yup.number()
    .min(0, "Discounted asset must be between 0 and 100")
    .max(50, "Discounted asset must be between 0 and 100")
    .required("Discounted asset is required and must be a number"),

  growth_rate: Yup.number().required(
    "Growth rate is required and must be a number"
  ),
  dividen: Yup.number()
    .min(0, "Dividen must be between 0 and 100")
    .max(100, "Dividen must be between 0 and 100")
    .required("Dividen is required and must be a number"),
});

export const CalculateCustomModel = async (
  req: Request,
  res: Response
): Promise<any> => {
  const {
    ticker,
    discounted_asset,
    user_conviction,
    net_income,
    market_share,
    stability,
    growth_rate,
    dividen,
  } = req.body;

  if (
    !ticker ||
    !discounted_asset ||
    !user_conviction ||
    !net_income ||
    !stability ||
    !growth_rate ||
    !dividen
  ) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const data = {
    ticker,
    discounted_asset: Number(discounted_asset),
    user_conviction: Number(user_conviction),
    net_income,
    market_share: isNaN(Number(market_share)) ? 0 : Number(market_share),
    stability: Number(stability),
    growth_rate: Number(growth_rate),
    dividen: Number(dividen),
  };

  try {
    await customModelSchema.validate(data, { abortEarly: false });
  } catch (validationError) {
    if (validationError instanceof Yup.ValidationError) {
      return res.status(400).json({ errors: validationError.errors });
    }
    return res
      .status(400)
      .json({ error: `Validation failed ${validationError}` });
  }

  try {
    let stockData = await executeWithCatch(() =>
      StockModel.getStockInformationByTicker(ticker)
    );

    if (!stockData) {
      logger.error(`Stock data not found for ticker: ${ticker}`);
      return res
        .status(422)
        .json({ error: `Stock data not found for ticker: ${ticker}` });
    }

    if (
      !stockData.currentShareOutstanding ||
      !stockData.currentBookValuePerShare ||
      !stockData.returnOnEquityTTM ||
      !stockData.financialLeverageQuarter
    ) {
      logger.error(
        `Stock data not found for ticker: ${ticker} : ${stockData.currentShareOutstanding} : ${stockData.currentBookValuePerShare} : ${stockData.returnOnEquityTTM} : ${stockData.financialLeverageQuarter}`
      );
      return res.status(422).json({
        error: `Total Equity, Current Book Value Per Share, or Return on Equity not found for ticker: ${ticker}`,
      });
    }
    if (
      isNaN(Number(stockData.currentBookValuePerShare)) ||
      isNaN(Number(stockData.returnOnEquityTTM)) ||
      isNaN(Number(stockData.financialLeverageQuarter))
    ) {
      return res.status(422).json({
        error: `Current Book Value Per Share or Return on Equity is not a number for ticker: ${ticker}`,
      });
    }
    let EPS = calculateEPS(stockData.currentShareOutstanding, net_income);

    const customValuation = new CustomValuation();
    const fair_value = customValuation.calculateFairValue(
      Number(stockData.currentBookValuePerShare),
      EPS,
      data.discounted_asset,
      data.user_conviction,
      data.stability,
      data.growth_rate,
      Number(stockData.returnOnEquityTTM),
      data.dividen,
      data.market_share,
      convertToNumber(data.net_income).toNumber(),
      Number(stockData.financialLeverageQuarter)
    );

    return res.json({
      data: fair_value,
      ticker: ticker,
    });
  } catch (err) {
    logger.error("Error calculating custom model:", err);
    res.status(500).json({ error: (err as Error).message });
  }
};
