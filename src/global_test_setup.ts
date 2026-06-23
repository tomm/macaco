import { sql } from "./backend/commands/sql.ts";
import * as migrate from "tiny-postgres-migrator";

if (process.env["NODE_ENV"] !== "test") {
    console.error("Error: You must set NODE_ENV=test when running the tests");
    process.exit(-1);
}

export async function globalSetup() {
    console.log("Rebuilding test DB...");
    await sql`drop schema if exists public cascade`;
    await sql`create schema public`;
    await migrate.applyAllMigrations(sql, [process.cwd() + "/migrations"]);
}

export async function globalTeardown() {
    await sql.end();
}
