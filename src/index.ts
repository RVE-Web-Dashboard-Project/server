import dotenv from "dotenv";
import express from "express";
dotenv.config();
import bodyParser from "body-parser";
import ConsoleStamp from "console-stamp";
import cors from "cors";
import dateformat from "dateformat";
import morgan from "morgan"; // console log every request

import { checkRequestAuthentication, initializeAuthentication } from "./auth/utils";
import commandsRouter from "./components/commands/commands_router";
import coordinatorRouter from "./components/coordinator/coordinator_router";
import userRouter from "./components/user/user_router";
import { checkEnvironmentVariables } from "./env.checks";
import { createWsApp } from "./ws/createWsApp";

// instanciate express app
const app = express();
// add websocket server
const server = createWsApp(app);

if (!checkEnvironmentVariables()) {
    process.exit(1);
}

initializeAuthentication(app);

const port = Number(process.env.PORT) || 3000;

// custom console log format
ConsoleStamp(console, {
    format: ":date(dd/mm/yyyy HH:MM:ss).blueBright :label(7)",
    extend: {
        debug: 5,
        fatal: 0,
    },
    include: ["debug", "info", "log", "warn", "error", "fatal"],
    level: "debug",
});

// Set up CORS
app.use(cors({
    origin: process.env.CORS_ACCEPTED_DOMAINS.split(","),
}));

// Remove x-powered-by header
app.disable("x-powered-by");

// log every request to the console
morgan.token("date", (req) => dateformat(req._startTime, "dd/mm/yyyy HH:MM:ss"));
morgan.token("err", (req, res) => (res._err ? ` - [${res._err}]` : "\u200b"));
app.use(morgan("\u001b[94m[:date[iso]]\u001b[0m [REQ]   :method :status :url:err - :response-time ms"));

app.use(bodyParser.json());

// add routers
app.use("/commands", commandsRouter);
app.use("/coordinator", coordinatorRouter);
app.use("/user", userRouter);


app.get("/", async (req, res) => {
    const isAuthenticated = await checkRequestAuthentication(req);
    res.send({ success: true, version: process.env.npm_package_version, isAuthenticated });
});

server.listen(port, () => {
    console.info(`App V${process.env.npm_package_version} is running on http://localhost:${port} !`);
});
