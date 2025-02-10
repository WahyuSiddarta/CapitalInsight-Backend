import { Router } from "express";
import * as controller from "../controllers";
import { customApiLimiter } from "../middleware";

const router = Router();
router.get(
  "/tickers",
  customApiLimiter({ windowMs: 10 * 60 * 1000, max: 50 }),
  controller.GetAllStockTicker
);

router.get(
  "/fundamental/erm",
  customApiLimiter({ windowMs: 10 * 60 * 1000, max: 50 }),
  controller.GetERMValuation
);

export default router;
