# Macaco

Web app template using Esbuild, React, Fastify, Postgres, and a statically-validated client-server API.

## How to use

Clone macaco as the start of your project. If you plan to keep your project in
sync with macaco then avoid changing the source files prefixed with macaco_
(eg. macaco_core.ts), as they are 'framework' code.

## How to install dependencies

```
npm i
```

## How to build and run (development)

To start a daemon that builds, runs tests, and starts a webserver each time
your code changes, run:

```
npm run devserver
```

## How to run migrations (and use the Macaco CLI)

To see the available CLI commands:

```
npm run cli
```

To see the available DB migration commands:

```
npm run cli migrate
```

To migrate the test DB:

```
NODE_ENV=test npm run cli migrate
```

## How to build and run (production)

```
npm run build
node dist/server.js
```

## Environment variables

- DATABASE_POOL_SIZE - Number of pool connections to Postgres
- DATABASE_URL - Postgres connection string
- PORT - Port webserver will listen on
- SERVER_SECRET - Used for encrypted cookies. Generate with `npm run cli generate_server_secret`
- TEST_DATABASE_URL - Postgres connection string for running the tests
- WEB_CONCURRENCY - Number of webserver processes to spawn
