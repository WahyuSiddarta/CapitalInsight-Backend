import { Router } from "express";
import express from "express";
import * as controller from "../controllers";
import { customApiLimiter } from "../middleware";

const router = Router();
router.use(express.urlencoded({ extended: true }));

// stock api group
router.get("/stock/tickers", controller.GetAllStockTicker);

// fundamental api group
router.post(
  "/fundamental/erm",
  customApiLimiter({ windowMs: 1 * 60 * 1000, max: 60 }),
  controller.CalculateERMValuation
);

router.post(
  "/fundamental/custom-model",
  customApiLimiter({ windowMs: 1 * 60 * 1000, max: 60 }),
  controller.CalculateCustomModel
);

export default router;
