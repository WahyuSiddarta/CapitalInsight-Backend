import { Router } from "express";
import * as controller from "../controllers";
import { authenticateJWT, customApiLimiter } from "../middleware";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  customApiLimiter({ windowMs: 10 * 60 * 1000, max: 50 }),
  controller.getProducts
);

export default router;
