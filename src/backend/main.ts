import Fastify from 'fastify';
import { startCluster } from "./macaco_webserver";

process.on("unhandledRejection", (error: any) => {
  console.log("Unhandled promise rejection: " + error?.stack);
});

startCluster(() => Fastify({ logger: false }));
