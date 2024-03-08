import sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import { error } from "@common/macaco_common";
import cluster from "cluster";
import crypto from "crypto";
import { FastifyInstance } from "fastify";
import fastifySecureSession from "@fastify/secure-session";
import fastifyStatic from "@fastify/static";
import * as os from "os";
import path from "path";
import { setupRoutes } from "./route_handlers";

const port = process.env["PORT"] ? parseInt(process.env["PORT"]) : 3000;

export function setupApp(fastifyFactory: () => FastifyInstance): FastifyInstance {
    const fastify = fastifyFactory();

    const secret = Buffer.from(process.env["SERVER_SECRET"] || error("SERVER_SECRET not set!"), "hex");
    if (secret.length !== 32) error("Invalid SERVER_SECRET");

    fastify.register(fastifySecureSession, { key: secret });

    setupRoutes(fastify);

    fastify.register(fastifyStatic, {
        root: path.join(process.cwd(), "public"),
        prefix: "/",
    });

    return fastify;
}

export async function startWebserver(fastifyFactory: () => FastifyInstance) {
    const fastify = setupApp(fastifyFactory);

    fastify.listen({ port }).catch((err) => {
        fastify.log.error(err);
        process.exit(1);
    });
}

export async function startCluster(fastifyFactory: () => FastifyInstance) {
    const numProcesses = process.env["WEB_CONCURRENCY"] ? parseInt(process.env["WEB_CONCURRENCY"]) : os.cpus().length;

    if (numProcesses === 1 || !cluster.isMaster) {
        startWebserver(fastifyFactory);
        console.log(
            `${new Date().toISOString()} | Server pid ${process.pid} listening on :${port} (${
                process.memoryUsage().rss / 1024
            } KiB RSS)`,
        );
    } else {
        console.log(`${new Date().toISOString()} | Starting ${numProcesses} webserver processes`);
        for (let i = 0; i < numProcesses; i++) {
            cluster.fork();
        }

        cluster.on("exit", (worker, _code, _signal) => {
            console.log(`Webserver worker pid ${worker.process.pid} exited`);
        });
    }
}

export function generateServerSecret() {
    return crypto.randomBytes(32).toString("hex");
}
