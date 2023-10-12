import type { User as PrismaUser } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_TOKEN_EXPIRATION_DAYS?: string;
    }
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