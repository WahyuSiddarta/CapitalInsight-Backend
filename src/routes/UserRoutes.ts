import { Router } from "express";
import * as controller from "../controllers";

const router = Router();

// user api group
router.get("/user", controller.getUserData);

export default router;
