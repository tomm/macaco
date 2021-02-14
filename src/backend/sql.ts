import postgres from "postgres";

if (!process.env['DATABASE_URL']) {
  console.error("Error: Missing DATABASE_URL environment variable");
  process.exit(-1);
}

export const sql = postgres(
  process.env['DATABASE_URL'],
  {
    max: process.env['DATABASE_POOL_SIZE'] ? parseInt(process.env['DATABASE_POOL_SIZE']) : 10,
    debug: (con, query, params) => console.log(query, params),
  }
);
