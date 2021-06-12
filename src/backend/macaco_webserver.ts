require("source-map-support").install();
import { FastifyInstance } from 'fastify';
import fastifyStatic from "fastify-static";
import fastifySecureSession from "fastify-secure-session";
import path from "path";
import cluster from "cluster";
import crypto from "crypto";
import { setupRoutes } from "./route_handlers";
import { error } from "../common/macaco_common";
  
const port = process.env['PORT'] || 3000;

export function setupApp(fastifyFactory: () => FastifyInstance): FastifyInstance {
  const fastify = fastifyFactory();

  const secret = Buffer.from(process.env['SERVER_SECRET'] || error('SERVER_SECRET not set!'), 'hex');
  if (secret.length != 32) error('Invalid SERVER_SECRET');

  fastify.register(fastifySecureSession, { key: secret });

  setupRoutes(fastify);

  fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/'
  })

  return fastify;
}

export async function startWebserver(fastifyFactory: () => FastifyInstance) {
  const fastify = await setupApp(fastifyFactory);

  fastify.listen(
    port
  ).catch(err => {
    fastify.log.error(err)
    process.exit(1)
  });
}

export async function startCluster(fastifyFactory: () => FastifyInstance) {
  const numProcesses = process.env["WEB_CONCURRENCY"] || require("os").cpus().length;

  if (numProcesses == 1 || !cluster.isMaster) {
    startWebserver(fastifyFactory);
    console.log(`${new Date().toISOString()} | Server pid ${process.pid} listening on :${port} (${process.memoryUsage().rss / 1024} KiB RSS)`);
  } else {
    console.log(`${new Date().toISOString()} | Starting ${numProcesses} webserver processes`);
    for (let i = 0; i < numProcesses; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Webserver worker pid ${worker.process.pid} exited`);
    });
  }
}

export function generateServerSecret() {
  return crypto.randomBytes(32).toString('hex');
}
