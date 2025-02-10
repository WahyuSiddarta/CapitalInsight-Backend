import { Router } from "express";
import * as controller from "../controllers";
import { authenticateJWT } from "../middleware";

const router = Router();

router.get("/", authenticateJWT, controller.getUsers);

export default router;
