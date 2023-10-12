import { PrismaClient } from "@prisma/client";


export default class Database extends PrismaClient {
    private static instance: PrismaClient;

    public static getInstance(): PrismaClient {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private constructor() {
        super();
    }
}