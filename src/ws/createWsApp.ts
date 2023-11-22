import { Express } from "express";
import http from "http";
import { Server as WsServer } from "ws";

import { getUserFromToken } from "../auth/utils";
import { IncomingWsMessage } from "../types";
import { eventEmitter } from "./event_emitter";

/**
 * Try to get an authentication token from the "Authorization" or "Sec-Websocket-Protocol" headers
 * @param headers the headers of the incoming request
 */
function getTokenFromWsHeaders(headers: http.IncomingHttpHeaders) {
    let token = headers.authorization as string | undefined;
     if (!token) {
        token = headers["sec-websocket-protocol"] as string | undefined;
        if (token?.startsWith("Authorization, ")) {
            token = token.slice(15);
        }
    } else if (token.startsWith("Bearer ")) {
        token = token.slice(7);
    }
    return token;

}

export function createWsApp(app: Express) {
    const server = http.createServer(app);

    const wss = new WsServer({
        server,
        verifyClient: (info, cb) => {
            // check for token in headers when a new client connects
            const token = getTokenFromWsHeaders(info.req.headers);
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
                            console.info(`WS client accepted (user ${user.id})`);
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

    eventEmitter.on("mqtt_connection_update", (status) => {
        const data = JSON.stringify({
            type: "mqtt_connection_update",
            status,
        });
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(data);
            }
        });
    });

    eventEmitter.on("test_body", (json) => {
        if (process.env.NODE_ENV === "development") {
            const data = JSON.stringify(json);
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(data);
                }
            });
        }
    });

    return server;
}