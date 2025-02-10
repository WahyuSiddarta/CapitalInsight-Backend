import { Router } from "express";
import * as controller from "../controllers";
import { authenticateJWT, customApiLimiter } from "../middleware";

const router = Router();
router.get(
  "/tickers",
  // authenticateJWT,
  customApiLimiter({ windowMs: 10 * 60 * 1000, max: 50 }),
  controller.GetAllStockTicker
);

router.get(
  "/api/fundamental/erm",
  // authenticateJWT,
  customApiLimiter({ windowMs: 10 * 60 * 1000, max: 50 }),
  controller.GetERMValuation
);

export default router;
