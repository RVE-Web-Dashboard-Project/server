import dotenv from "dotenv";
import express from "express";
dotenv.config();
import bodyParser from "body-parser";
import ConsoleStamp from "console-stamp";

import { initializeAuthentication } from "./auth/utils";
import userRouter from "./components/user/user_router";

const app = express();

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

app.use(bodyParser.json());

// add routers
app.use(userRouter);


app.get("/", (req, res) => {
    const isAuth = req.isAuthenticated();
    res.send({ success: true, version: process.env.npm_package_version, isAuthenticated: isAuth });
});

app.listen(port, () => {
    console.info(`App V${process.env.npm_package_version} is running on http://localhost:${port} !`);
});
