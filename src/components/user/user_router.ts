import express from "express";

import { isAdminCheck } from "../../auth/middlewares";
import * as USR from "./user_controller";

const router = express.Router();

router.post("/login", USR.login);
router.post("/logout", USR.logout);

router.post("/", isAdminCheck, USR.createUser);

export default router;