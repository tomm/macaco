exports.up = async function(sql) {
  await sql`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
  `;
};

exports.down = async function(sql) {
  await sql`
    DROP EXTENSION "uuid-ossp"
  `;
};
