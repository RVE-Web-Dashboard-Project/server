import express from "express";

import { isAdminCheck, isAuthenticatedCheck } from "../../auth/middlewares";
import * as CMD from "./commands_controller";

const router = express.Router();

router.get("/", isAuthenticatedCheck, CMD.getCommandsList);
router.get("/broker", isAuthenticatedCheck, CMD.getBrokerConnectionStatus);

router.post("/", isAuthenticatedCheck, CMD.sendCommand);

if (process.env.NODE_ENV === "development") {
    router.post("/test-ws", isAdminCheck, CMD.testWSConnection);
}

export default router;