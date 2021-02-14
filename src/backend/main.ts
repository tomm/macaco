import Fastify from 'fastify';
import fastifyStatic from "fastify-static";
import fastifySecureSession from "fastify-secure-session";
import path from "path";
import cluster from "cluster";
import { setupRoutes } from "./route_handlers";
import { error } from "../common/error";

process.on("unhandledRejection", (error: any) => {
  console.log("Unhandled promise rejection: " + error?.stack);
});

function startWebserver() {
  const fastify = Fastify({ logger: true });

  fastify.register(fastifySecureSession, {
    key: Buffer.from(process.env['SERVER_SECRET'] || error('SERVER_SECRET not set!'), 'hex')
  });

  setupRoutes(fastify);

  fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/'
  })

  fastify.listen(
    process.env['PORT'] || 3000
  ).catch(err => {
    fastify.log.error(err)
    process.exit(1)
  });
}

const start = async () => {
  const numProcesses = process.env["WEB_CONCURRENCY"] || require("os").cpus().length;

  if (numProcesses == 1 || !cluster.isMaster) {
    startWebserver();
  } else {
    console.log(`Starting ${numProcesses} webserver processes`);
    for (let i = 0; i < numProcesses; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Webserver worker pid ${worker.process.pid} exited`);
    });
  }
}
start();
