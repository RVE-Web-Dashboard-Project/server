# server
The backend server of our Web Dashboard

## Prisma usage

[Prisma](https://prisma.io) is a tool that allows us to interact with our database in a type-safe way. One of its tasks is to generate migration files between the database versions.

**Creating a migration while developing/contributing:**
1. Edit the `./prisma/schema.prisma` file
2. Create a new migration
    ```bash
    npx prisma migrate dev --name <migration-name>
    ```

**Squash migrations before pushing to the main branch:**
1. Reset the `./prisma/migrations` folder to to match the migration history on the `main` branch
2. Create a new migration
    ```bash
    npx prisma migrate dev --name squashed_migrations
    ```


**Applying the migration to the database:**
```bash
npx prisma migrate deploy
```

