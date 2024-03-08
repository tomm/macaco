import postgres from "postgres";

/* Useful short alias for postgres transaction connection */
export type DbXa = postgres.TransactionSql<any>;
export type DbCon = postgres.Sql<any>;
export type SqlFragment = postgres.PendingQuery<postgres.Row[]>;

/* Database access */
export const dbEnvVar = process.env["NODE_ENV"] === "test" ? "TEST_DATABASE_URL" : "DATABASE_URL";

if (!process.env[dbEnvVar]) {
    console.error(`Error: Missing ${dbEnvVar} environment variable`);
    process.exit(-1);
}

export const sql = postgres(process.env[dbEnvVar] as string, {
    max: process.env["DATABASE_POOL_SIZE"] ? parseInt(process.env["DATABASE_POOL_SIZE"]) : 10,
    onnotice: process.env["NODE_ENV"] === "test" ? () => ({}) : console.log,
    // debug: (con, query, params) => console.log(query, params),
});
