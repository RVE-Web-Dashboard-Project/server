import jwt from "jsonwebtoken";

import Database from "../database";

const db = Database.getInstance();

/**
 * Cron task that runs every day to remove expired tokens from the database.
 */
async function cleanupExpiredTokens() {
    console.log("[CRON] Running task to cleanup expired tokens");
    const tokens = await db.userToken.findMany();
    const tokensToDelete = [];
    for (const token of tokens) {
        if (!jwt.verify(token.token, process.env.JWT_SECRET)) {
            tokensToDelete.push(token.id);
        }
    }
    await db.userToken.deleteMany({ where: { id: { in: tokensToDelete } } });
    console.log(`[CRON] ${tokensToDelete.length} expired tokens deleted`);
}

export const cronTasks = {
    "0 0 * * *": cleanupExpiredTokens, // every day at midnight
};