import { NextFunction, Request, Response } from "express";
import passport from "passport";

import { getUserFromRequest } from "./utils";

export const isAuthenticatedCheck = passport.authenticate("jwt", { session: false });


export async function isAdminCheck(req: Request, res: Response, next: NextFunction) {
    if (req.user !== undefined) {
        if (!req.user.isAdmin) {
            return res.status(403).json("Unauthorized");
        }
        next();
    } else {
        try {
            const user = await getUserFromRequest(req);
            if (!user.isAdmin) {
                return res.status(403).json("Unauthorized");
            }
            next();
        } catch (err) {
            return res.status(401).json("Unauthorized");
        }
    }
}