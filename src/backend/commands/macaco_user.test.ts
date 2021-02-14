const test = require('baretest')('Macaco User');
import * as UserCmd from "./macaco_user";
import { sql } from "../macaco_core";
import assert from "assert";

test('Create user and check passwords', async () => {
  await sql`delete from users`;

  const user = await UserCmd.createUser({ email: 'test@example.com', password: 'testpassword' });

  assert.deepEqual(
    await UserCmd.checkUserLogin({ email: user.email, password: 'testpassword' }),
    { email: 'test@example.com', guid: user.guid }
  );

  assert.strictEqual(
    await UserCmd.checkUserLogin({ email: user.email, password: 'wrong password' }),
    undefined
  );
});

export default test;
