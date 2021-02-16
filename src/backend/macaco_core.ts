import postgres from "postgres";
import * as Safe from "safe-portals";
import { FastifyInstance, FastifyRequest } from 'fastify';
import { User, UserSerializer, Route } from "../common/macaco_common";

/* Database access */

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

/* Type-safe, validated route handling */

export type RouteHandler<IN, OUT> = (args: IN, user: User | undefined, req: FastifyRequest) => Promise<OUT>;

export function handleRoute<IN, OUT>(fastify: FastifyInstance, route: Route<IN, OUT>, handler: RouteHandler<IN, OUT>) {
  fastify.post(route.path, async (req, reply) => {
    const user = Safe.optional(UserSerializer).read(req.session.get('loggedInUser'));
    try {
      const posted_csfr = (req.body as any).csfr_token;
      if (!(posted_csfr && posted_csfr === req.cookies['macaco.csfr'])) {
        console.error(`Error: request to ${route.path} has invalid CSFR token`);
        reply.status(403).send('CSFR token mismatch');
        return;
      }

      const _in = route.inputType.read((req.body as any).args);
      return route.outputType.write(await handler(_in, user, req));
    } catch (e) {
      if (e instanceof Safe.ValidationError) {
        reply.status(400).send('Invalid request');
      } else {
        reply.status(500).send('Server error');
        throw e;
      }
    }
  });
}
