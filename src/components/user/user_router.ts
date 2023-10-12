import express from "express";

import * as USR from "./user_controller";

const router = express.Router();

router.post("/login", USR.login);
router.post("/logout", USR.logout);

export default router;