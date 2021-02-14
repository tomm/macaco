const migrate = require('tiny-postgres-migrator');
const postgres = require('postgres');
import crypto from "crypto";
import { createUser } from "./commands/user";

const args = process.argv.slice(2);

process.on("unhandledRejection", (error: any) => {
  console.log("Error: " + error?.stack);
  process.exit(-1);
});

if (args[0] == 'adduser' && args.length == 3) {
  createUser({ email: args[1], password: args[2] }).then((user) => {
    console.log(`User created: ${JSON.stringify(user)}`);
    process.exit(0);
  });
} else if (args[0] == 'migrate') {
  if (!process.env['DATABASE_URL']) {
    console.log("Missing required environment variable: DATABASE_URL");
    process.exit(0);
  }

  console.log(process.cwd());
  const sql = postgres(process.env['DATABASE_URL']);

  migrate.cmd('npm run cli migrate', sql, [process.cwd() + '/migrations'], args.slice(1));
} else if (args[0] == 'generate_server_secret') {
  console.log("Generating server secret... (use value in the SERVER_SECRET environment variable)");
  console.log("Secret: " + crypto.randomBytes(32).toString('hex'));
} else {
  console.log(`Usage:
  npm run cli adduser <username> <password>
  npm run cli migrate                             # run to see migrator options
  npm run cli generate_server_secret
`);
}
