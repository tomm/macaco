import postgres from "postgres";
import * as Safe from "safe-portals";
import { FastifyInstance, FastifyRequest } from 'fastify';
import { User, UserSerializer, Route } from "../common/macaco_common";

/* Database access */
const dbEnvVar = process.env['NODE_ENV'] == 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL';

if (!process.env[dbEnvVar]) {
  console.error(`Error: Missing ${dbEnvVar} environment variable`);
  process.exit(-1);
}

export const sql = postgres(
  process.env[dbEnvVar] as string,
  {
    max: process.env['DATABASE_POOL_SIZE'] ? parseInt(process.env['DATABASE_POOL_SIZE']) : 10,
    //debug: (con, query, params) => console.log(query, params),
  }
);

/* Type-safe, validated route handling */

export type RouteHandler<IN, OUT> = (args: IN, user: User | undefined, req: FastifyRequest) => Promise<OUT>;

export function handleRoute<IN, OUT>(fastify: FastifyInstance, route: Route<IN, OUT>, handler: RouteHandler<IN, OUT>) {
  fastify.post(route.path, async (req, reply) => {
    // only accept application/json
    if (!(req.headers['content-type'] == 'application/json' ||
          req.headers['content-type']?.startsWith('application/json;'))) {
      return reply.status(415).send('Unsupported media type');
    }

    const user = Safe.optional(UserSerializer).read(req.session.get('loggedInUser'));
    try {
      const posted_csrf = req.headers['x-csrf-token'];
      if (!(posted_csrf && posted_csrf === req.cookies['macaco.csrf'])) {
        reply.status(403).send('CSRF token mismatch');
        return;
      }
      const _in = route.inputType.read((req.body as any).args);
      return { result: route.outputType.write(await handler(_in, user, req)) };
    } catch (e) {
      if (e instanceof Safe.ValidationError) {
        return reply.status(400).send('Invalid request');
      } else {
        reply.status(500).send('Server error');
        console.log(e.stack);
        throw e;
      }
    }
  });
}
