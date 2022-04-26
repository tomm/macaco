import * as migrate from 'tiny-postgres-migrator';
import postgres from "postgres";
import { dbEnvVar } from "./macaco_core";
import { createUser } from "./commands/macaco_user";
import { generateServerSecret } from "./macaco_webserver";

const args = process.argv.slice(2);

const sql = postgres(
  process.env[dbEnvVar] as string,
  { no_prepare: true } // prepared statements with migrations = bad
);

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
  migrate.cmd('npm run cli migrate', sql, [process.cwd() + '/migrations'], args.slice(1));
} else if (args[0] == 'generate_server_secret') {
  console.log("Generating server secret... (use value in the SERVER_SECRET environment variable)");
  console.log("Secret: " + generateServerSecret());
} else {
  console.log(`Usage:
  npm run cli adduser <email> <password>
  npm run cli migrate                             # run to see migrator options
  npm run cli generate_server_secret
`);
}
