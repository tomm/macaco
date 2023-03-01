import Fastify from "fastify";
import { PostgresError } from "postgres";
import { startCluster } from "./macaco_webserver";

process.on("unhandledRejection", (error: unknown) => {
    console.log("----- Unhandled promise rejection in test -----");
    console.log(error);
    if (error instanceof PostgresError) {
        console.debug(error.query);
        console.debug(error.parameters);
    }
    console.log("-----------------------------------------------");
});

const appFactory = () => Fastify({ logger: false });

/* this test doesn't work with esbuild tho... */
if (require.main === module) {
    startCluster(appFactory);
}
