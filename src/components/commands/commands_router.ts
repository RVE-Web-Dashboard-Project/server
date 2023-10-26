import express from "express";

import { isAuthenticatedCheck } from "../../auth/middlewares";
import * as CMD from "./commands_controller";

const router = express.Router();

router.get("/broker", isAuthenticatedCheck, CMD.getBrokerConnectionStatus);

export default router;