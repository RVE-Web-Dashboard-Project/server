import express, { Request } from "express";
import passport, { AuthenticateCallback } from "passport";
import { ExtractJwt, Strategy as JwtStrategy, VerifyCallback } from "passport-jwt";

import Database from "../database";

type App = ReturnType<typeof express>;

const verifyCallback: VerifyCallback = async (jwtPayload, done) => {
    const db = Database.getInstance();
    const user = await db.user.findUnique({ where: { id: jwtPayload.result.id } });
    if (!user) return done(null, false);
    return done(null, user);
};

export function initializeAuthentication(app: App) {
    app.use(passport.initialize());

    const db = Database.getInstance();

    passport.use(new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        verifyCallback
    ));
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser(async (id, done) => {
        if (typeof id !== "number") return done(null, null);
        const user = await db.user.findUnique({ where: { id } });
        return done(null, user);
    });
}

/**
 * Check if the given request has a valid authentication token, and return the user if it does.
 * @param req
 * @returns The user if the request has a valid token, otherwise an error.
 */
export function getUserFromRequest(req: Request) {
    return new Promise<Express.User>((resolve, reject) => {
        const callback: AuthenticateCallback = (err, user) => {
            if (err) return reject(err);
                if (!user) return reject(new Error("Invalid token"));
                return resolve(user);
        };
        passport.authenticate("jwt", { session: false }, callback)(req);
    });
}

/**
 * Check if the given request has a valid authentication token.
 * @param req
 * @returns True if the request has a valid token, otherwise false.
 */
export async function checkRequestAuthentication(req: Request) {
    try {
        await getUserFromRequest(req);
        return true;
    } catch (err) {
        return false;
    }
}