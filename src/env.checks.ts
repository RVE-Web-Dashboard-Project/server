import { ProcessEnvVariables } from "./types";

type EnvVariableNames = (keyof ProcessEnvVariables)[];

const requiredEnvVariables: EnvVariableNames = [
    "DATABASE_URL",
    "JWT_SECRET",
    "CORS_ACCEPTED_DOMAINS",
    "MQTT_BROKER_URL",
    "MQTT_BROKER_TLS_PORT",
    "MQTT_SENDCMD_TOPIC",
    "MQTT_RECEIVE_TOPIC",
    "MQTT_USERNAME",
    "MQTT_CLIENT_ID",
    "MQTT_PASSWORD",
];


/**
 * Checks if all required environment variables are set.
 * @returns true if all required environment variables are set, false otherwise.
 */
export function checkEnvironmentVariables() {
    const missingVariables = requiredEnvVariables.filter(key => process.env[key] === undefined);
    if (missingVariables.length > 0) {
        console.error("FATAL ERROR: Missing environment variables:", missingVariables);
        return false;
    }

    if (process.env.PORT && isNaN(Number(process.env.PORT))) {
        console.error("FATAL ERROR: PORT is not a number");
        return false;
    }

    if (process.env.JWT_SECRET.length < 15) {
        console.error("FATAL ERROR: JWT_SECRET is too short");
        return false;
    }

    if (isNaN(Number(process.env.MQTT_BROKER_TLS_PORT))) {
        console.error("FATAL ERROR: MQTT_BROKER_TLS_PORT is not a number");
        return false;
    }

    if (process.env.NODE_ENV !== undefined && !["development", "production"].includes(process.env.NODE_ENV)) {
        console.error("FATAL ERROR: NODE_ENV is not valid");
        return false;
    }

    return true;
}