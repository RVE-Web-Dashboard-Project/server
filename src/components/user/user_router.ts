import express from "express";

import { isAdminCheck, isAuthenticatedCheck } from "../../auth/middlewares";
import * as USR from "./user_controller";

const router = express.Router();

router.get("/me", isAuthenticatedCheck, USR.getMe);
router.get("/invitation/:code", USR.getInvitationInfo);

router.post("/login", USR.login);
router.post("/logout", isAuthenticatedCheck, USR.logout);
router.post("/edit-password", isAuthenticatedCheck, USR.changePassword);

router.post("/invite", isAdminCheck, USR.inviteUser);
router.post("/invitation/:code", USR.acceptInvitation);

export default router;