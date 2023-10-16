import express from "express";

import { isAdminCheck, isAuthenticatedCheck } from "../../auth/middlewares";
import * as USR from "./user_controller";

const router = express.Router();

router.get("/me", isAuthenticatedCheck, USR.getMe);

router.post("/login", USR.login);
router.post("/logout", USR.logout);

router.post("/", isAdminCheck, USR.createUser);

export default router;