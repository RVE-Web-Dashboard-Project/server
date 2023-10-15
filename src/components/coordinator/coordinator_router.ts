import express from "express";

import * as CRD from "./coordinator_controller";

const router = express.Router();

router.get("/nodes", CRD.getNodes);

export default router;