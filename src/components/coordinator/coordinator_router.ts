import express from "express";

import { isAdminCheck, isAuthenticatedCheck } from "../../auth/middlewares";
import * as CRD from "./coordinator_controller";

const router = express.Router();

router.get("/nodes", isAuthenticatedCheck, CRD.getNodes);

router.put("/nodes", isAdminCheck, CRD.editNodes);

export default router;