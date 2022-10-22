import Fastify from "fastify";
import { startCluster } from "./macaco_webserver";

process.on("unhandledRejection", (error: any) => {
    console.log("Unhandled promise rejection: " + error?.stack);
});

const appFactory = () => Fastify({ logger: false });

if (require.main === module) {
    startCluster(appFactory);
}
