import express from "express";
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import ConsoleStamp from "console-stamp";

const app = express();

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


app.get("/", (req, res) => {
    res.send({ success: true, version: process.env.npm_package_version });
});

app.listen(port, () => {
    console.info(`App V${process.env.npm_package_version} is running on http://localhost:${port} !`);
});