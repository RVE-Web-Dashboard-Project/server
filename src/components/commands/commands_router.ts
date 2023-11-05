import express from "express";

import { isAuthenticatedCheck } from "../../auth/middlewares";
import * as CMD from "./commands_controller";

const router = express.Router();

router.get("/", isAuthenticatedCheck, CMD.getCommandsList);
router.get("/broker", isAuthenticatedCheck, CMD.getBrokerConnectionStatus);

router.post("/", isAuthenticatedCheck, CMD.sendCommand);

export default router;