import { Express } from "express";
import http from "http";
import { Server as WsServer } from "ws";

import { getUserFromToken } from "../auth/utils";
import { IncomingWsMessage } from "../types";

export function createWsApp(app: Express) {
    const server = http.createServer(app);

    const wss = new WsServer({
        server,
        verifyClient: (info, cb) => {
            // check for token in headers when a new client connects
            const token = info.req.headers.authorization as string | undefined;
            if (!token) {
                console.info("WS client rejected: no token");
                cb(false, 401, "Unauthorized");
            } else {
                getUserFromToken(token)
                    .then(user => {
                        if (!user) {
                            console.info("WS client rejected: invalid token");
                            cb(false, 401, "Unauthorized");
                        } else {
                            console.info("WS client accepted for user", user.id);
                            (info.req as IncomingWsMessage).user = user;
                            cb(true);
                        }
                    })
                    .catch(err => {
                        console.error("WS client rejected: error while checking token:", err);
                        cb(false, 500, "Internal Server Error");
                    });
            }
        },
    });

    // print any error to console
    wss.on("error", (err) => {
        console.error("Websocket error", err);
    });

    return server;
}