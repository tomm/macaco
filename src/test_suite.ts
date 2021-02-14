require("source-map-support").install();
import user_test from "./backend/commands/macaco_user.test";
import core_tests from "./backend/macaco_core.test";
import { sql } from "./backend/macaco_core";

if (process.env['NODE_ENV'] != 'test') {
  console.error("Error: You must set NODE_ENV=test when running the tests");
  process.exit(-1);
}

!(async function() {
  await core_tests.run();
  await user_test.run();
  await sql.end();
})()
