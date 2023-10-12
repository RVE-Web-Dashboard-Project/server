import express from "express";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy, VerifyCallback } from "passport-jwt";

import Database from "../database";

type App = ReturnType<typeof express>;

const verifyCallback: VerifyCallback = async (jwtPayload, done) => {
    const db = Database.getInstance();
    const user = await db.user.findUnique({ where: { id: jwtPayload.id } });
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