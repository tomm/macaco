import assert from "assert";
import baretest from "baretest";
import { appFactory } from "./main";
import { setupApp } from "./macaco_webserver";
import { Route } from "../common/macaco_common";
import * as UserCmd from "./commands/macaco_user";
import { sql } from "./macaco_core";
import { Response } from "light-my-request";
import * as routes from "../common/routes";

const test = baretest('Macaco Core');
const app = setupApp(appFactory);

export async function callRoute<IN, OUT>(route: Route<IN,OUT>, args: IN): Promise<[OUT, Response]> {
  const resp = await app.inject({
    method: "POST",
    url: route.path,
    payload: {
      args: route.inputType.write(args)
    },
    headers: { 'x-csrf': '1' }
  });
  return [route.outputType.read(JSON.parse(resp.body).result), resp];
}

test('Rejects non-json payload', async function() {
  const resp = await app.inject({ method: 'POST', url: '/ping', payload: 'hi', headers: {'content-type': 'text/plain'} });
  assert.equal(resp.statusCode, "415");
  assert.equal(resp.statusMessage, 'Unsupported Media Type');
})

test('Validates CSRF token', async function() {
  const resp = await app.inject({ method: 'GET', url: '/' });
  assert.equal(resp.statusCode, "200");

  {
    const r = await app.inject({
      method: 'POST',
      url: '/ping',
      payload: { args: {} },
    });
    assert.equal(r.statusCode, "403");
    assert.equal(r.body, "CSRF header missing");
  }

  {
    const resp2 = await app.inject({
      method: 'POST',
      url: '/ping',
      payload: { args: {} },
      headers: { 'x-csrf': "1" }
    });

    assert.equal(resp2.statusCode, 200);
    assert.equal(resp2.body, `{"result":"pong"}`);
  }
});


test('Can log in', async function() {
  const credentials = { email: 'test@example.com', password: 'testpassword' };
  await sql`delete from users`;
  await UserCmd.createUser(credentials);

  {
    const [result] = await callRoute(routes.tryLogin, credentials);
    assert.equal(result, true);
  }

  {
    const [result] = await callRoute(routes.tryLogin, { ...credentials, password: 'wrong' });
    assert.equal(result, false);
  }
});

export default test;
