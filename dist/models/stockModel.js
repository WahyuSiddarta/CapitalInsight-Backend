"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockModel = void 0;
const postgres_1 = __importDefault(require("../db/postgres"));
class StockModel {
    static getStockTickers() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield postgres_1.default.connect(); // Acquire a connection from the pool
            try {
                const res = yield client.query("SELECT a.ticker, (SELECT industri FROM m_ticker_target b WHERE a.ticker = b.ticker) as industri FROM t_stock_financial a");
                return res.rows.map((row) => ({
                    ticker: row.ticker,
                    industri: row.industri,
                }));
            }
            catch (err) {
                console.error("Error fetching stock tickers:", err);
                throw err;
            }
            finally {
                client.release(); // Release the connection back to the pool
            }
        });
    }
    static getStockInformationByTicker(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield postgres_1.default.connect(); // Acquire a connection from the pool
            try {
                const res = yield client.query("SELECT * FROM t_stock_financial WHERE ticker = $1", [ticker]);
                if (res.rows.length === 0) {
                    return null;
                }
                const row = res.rows[0];
                const stockData = {
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
            }
            catch (err) {
                console.error(`Error fetching stock information for ticker ${ticker}:`, err);
                throw err;
            }
            finally {
                client.release(); // Release the connection back to the pool
            }
        });
    }
}
exports.StockModel = StockModel;
