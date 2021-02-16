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
    cookies: { 'macaco.csfr': 'test' },
    payload: {
      csfr_token: 'test',
      args: route.inputType.write(args)
    }
  });
  return [route.outputType.read(JSON.parse(resp.body).result), resp];
}

test('Detects missing CSFR token', async function() {
  const resp = await app.inject({ method: 'POST', url: '/ping' });
  assert.equal(resp.statusCode, "403");
  assert.equal(resp.body, 'CSFR token mismatch');
})

test('Accepts correct CSFR token', async function() {
  const resp = await app.inject({ method: 'GET', url: '/' });
  assert.equal(resp.statusCode, "200");

  // must set csfr token cookie
  const csfr_token = (resp.cookies.find((c: any) => c['name'] == 'macaco.csfr') as any).value;
  assert(csfr_token);

  assert.equal(
    (await app.inject({
      method: 'POST',
      url: '/ping',
      cookies: { 'macaco.csfr': 'nonsense' },
      payload: { csfr_token, args: {} } })
    ).statusCode,
    "403"
  );

  {
    const resp2 = await app.inject({
      method: 'POST',
      url: '/ping',
      cookies: { 'macaco.csfr': csfr_token },
      payload: { csfr_token, args: {} }
    });

    assert.equal(resp2.statusCode, 200);
    assert.equal(resp2.body, `{"result":"pong"}`);
  }
});

test('Can call validated routes', async function() {
  const [result] = await callRoute(routes.ping, {});
  assert.equal(result, "pong");
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
