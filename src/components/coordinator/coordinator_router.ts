import express from "express";

import { isAuthenticatedCheck } from "../../auth/middlewares";
import * as CRD from "./coordinator_controller";

const router = express.Router();

router.get("/nodes", isAuthenticatedCheck, CRD.getNodes);

export default router;