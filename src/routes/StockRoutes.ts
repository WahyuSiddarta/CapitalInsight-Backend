import { Router } from "express";
import * as controller from "../controllers";
import { customApiLimiter } from "../middleware";

const router = Router();
// stock api group
router.get("/stock/tickers", controller.GetAllStockTicker);

// fundamental api group
router.post(
  "/fundamental/erm",
  customApiLimiter({ windowMs: 1 * 60 * 1000, max: 2 }),
  controller.CalculateERMValuation
);

router.get(
  "/fundamental/custom-model",
  customApiLimiter({ windowMs: 1 * 60 * 1000, max: 2 }),
  controller.CalculateCustomModel
);

export default router;
