require("source-map-support").install();
import { FastifyInstance } from 'fastify';
import fastifyStatic from "fastify-static";
import fastifySecureSession from "fastify-secure-session";
import path from "path";
import cluster from "cluster";
import crypto from "crypto";
import { setupRoutes } from "./route_handlers";
import { error } from "../common/macaco_common";
import { v4 as uuidv4 } from "uuid";

export function setupApp(fastifyFactory: () => FastifyInstance): FastifyInstance {
  const fastify = fastifyFactory();

  const secret = Buffer.from(process.env['SERVER_SECRET'] || error('SERVER_SECRET not set!'), 'hex');
  if (secret.length != 32) error('Invalid SERVER_SECRET');

  fastify.register(fastifySecureSession, { key: secret });

  /* Middleware to set a cookie with csfr token. This is echoed back by the client in request bodies for validation */
  fastify.addHook('onRequest', async (req, reply) => {
    // Set csfr token
    if (req.cookies['macaco.csfr'] == undefined) {
      reply.setCookie('macaco.csfr', uuidv4(), { path: '/', sameSite: "strict" } );
    }
  });

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
    process.env['PORT'] || 3000
  ).catch(err => {
    fastify.log.error(err)
    process.exit(1)
  });
}

export async function startCluster(fastifyFactory: () => FastifyInstance) {
  const numProcesses = process.env["WEB_CONCURRENCY"] || require("os").cpus().length;

  if (numProcesses == 1 || !cluster.isMaster) {
    startWebserver(fastifyFactory);
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
