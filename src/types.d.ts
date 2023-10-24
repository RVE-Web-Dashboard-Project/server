import type { User as PrismaUser } from "@prisma/client";

interface ProcessEnvVariables {
  PORT?: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_TOKEN_EXPIRATION_DAYS?: string;
  CORS_ACCEPTED_DOMAINS: string;
  MQTT_BROKER_URL: string;
  MQTT_BROKER_PORT: string;
  MQTT_SENDCMD_TOPIC: string;
  MQTT_RECEIVE_TOPIC: string;
  MQTT_USERNAME: string;
  MQTT_USER_ID: string;
  MQTT_PASSWORD: string;
}

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends ProcessEnvVariables {}
  }

  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends PrismaUser {}

    interface Response {
      _err?: string
    }
  }
}

declare module "http" {
  interface IncomingMessage {
    _startTime: Date
  }

  interface ServerResponse {
    _err?: string
  }
}