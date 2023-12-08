import express from "express";

import { isAdminCheck, isAuthenticatedCheck } from "../../auth/middlewares";
import * as INV from "./invitation_controller";

const router = express.Router();

router.get("/", isAdminCheck, INV.listInvitations);
router.get("/:code", INV.getInvitationInfo);

router.post("/", isAdminCheck, INV.inviteUser);
router.post("/:code", INV.acceptInvitation);

router.delete("/:code", isAuthenticatedCheck, INV.deleteInvitation);


export default router;