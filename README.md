# Macaco

Web app template using React, Fastify, Postgres, and a statically-validated client-server API.

## How to use

Clone macaco as the start of your project. Search around for the string
'macaco' and change to your project name.

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
