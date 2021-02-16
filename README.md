# Macaco

Web app template using React, Fastify, Postgres, and a statically-validated client-server API.

## How to use

Clone macaco as the start of your project. If you plan to keep your project in
sync with macaco then avoid changing the source files prefixed with macaco_
(eg. macaco_core.ts), as they are 'framework' code.

## How to install dependencies

```
npm i
```

## How to build and run (development)

In one terminal run the builder:

```
webpack -w
```

In another terminal run the webserver:

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

## How to build and run (production)

```
webpack
node dist/main.js
```

## Environment variables

 * WEB_CONCURRENCY - Number of webserver processes to spawn
 * PORT - Port webserver will listen on
 * DATABASE_URL - Postgres connection string
 * DATABASE_POOL_SIZE - Number of pool connections to Postgres
 * SERVER_SECRET - Used for encrypted cookies. Generate with `npm run cli generate_server_secret`
