import express from "express";

import { isAdminCheck, isAuthenticatedCheck } from "../../auth/middlewares";
import * as USR from "./user_controller";

const router = express.Router();

router.get("/", isAdminCheck, USR.listUsers);
router.get("/me", isAuthenticatedCheck, USR.getMe);

router.post("/login", USR.login);
router.post("/logout", isAuthenticatedCheck, USR.logout);
router.post("/edit-password", isAuthenticatedCheck, USR.editPassword);

router.delete("/me", isAuthenticatedCheck, USR.deleteMe);


export default router;