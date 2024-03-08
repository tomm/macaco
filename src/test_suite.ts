// require("source-map-support").install();
import { PostgresError } from "postgres";
import * as migrate from "tiny-postgres-migrator";
import user_test from "./backend/commands/macaco_user.test";
import { sql } from "./backend/commands/sql";
import core_tests from "./backend/macaco_core.test";

process.on("unhandledRejection", (error: unknown) => {
    console.log("----- Unhandled promise rejection in test -----");
    console.log(error);
    if (error instanceof PostgresError) {
        console.debug(error.query);
        console.debug(error.parameters);
    }
    console.log("-----------------------------------------------");
});

if (process.env["NODE_ENV"] != "test") {
    console.error("Error: You must set NODE_ENV=test when running the tests");
    process.exit(-1);
}

!(async function () {
    const start = Date.now();
    console.log("Rebuilding test DB...");
    await sql`drop schema if exists public cascade`;
    await sql`create schema public`;
    await migrate.applyAllMigrations(sql, [process.cwd() + "/migrations"]);

    console.log("Running test suite...");
    await core_tests.run();
    await user_test.run();
    await sql.end();
    console.log(`Test suite completed in ${Date.now() - start} ms`);
})();
