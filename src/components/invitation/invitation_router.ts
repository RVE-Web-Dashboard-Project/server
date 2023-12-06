import express from "express";

import { isAdminCheck } from "../../auth/middlewares";
import * as INV from "./invitation_controller";

const router = express.Router();

router.get("/", isAdminCheck, INV.listInvitations);
router.get("/:code", INV.getInvitationInfo);

router.post("/", isAdminCheck, INV.inviteUser);
router.post("/:code", INV.acceptInvitation);


export default router;