# RVE Web Dashboard - server
The backend server of our Web Dashboard


## Configuration

Create a `.env` file in the root of the project following the `.env.example` file.

Here are a description of the environment variables:
- `PORT` - the port on which the server will listen (3000 by default)
- `DATABASE_URL` - the path to the SQLite database (probably `"file:./dev.db"`)
- `JWT_SECRET` - the secret used to sign the JWT tokens
- `JWT_TOKEN_EXPIRATION_DAYS` - the number of days after which the JWT tokens will expire
- `CORS_ACCEPTED_DOMAINS` - a list of comma-separated domains that are allowed to access the API
- `MQTT_BROKER_URL` - the URL of the MQTT broker
- `MQTT_BROKER_TLS_PORT` - the port to use for the MQTT broker
- `MQTT_SENDCMD_TOPIC` - the topic to which the server will send commands
- `MQTT_RECEIVE_TOPIC` - the topic to which the server will listen for coordinator responses
- `MQTT_USERNAME` - the username to use to connect to the MQTT broker
- `MQTT_CLIENT_ID` - the client ID to use to connect to the MQTT broker
- `MQTT_PASSWORD` - the password to use to connect to the MQTT broker
- `NODE_ENV` - the environment in which the website is running (development/production)

## Installation for development

Will start the Nodemon development server (with hot-reload and debug tools) on a random port. NOT suitable for production.

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install dependencies: `npm install i`
3. Start the project: `npm run dev`


## Installation for production

Will build the project and start a basic HTTP server.

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install dependencies: `npm install ci`
3. Build and run the project: `npm start`

Optionally, if you only want to build the project without starting it, you can run `npm run build`.


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

