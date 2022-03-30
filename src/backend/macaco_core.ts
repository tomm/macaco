import postgres from "postgres";
import * as Safe from "safe-portals";
import { FastifyInstance, FastifyRequest } from 'fastify';
import * as UserCmd from "./commands/macaco_user";
import { User, UserSerializer, Route } from "../common/macaco_common";

/* Database access */
export const dbEnvVar = process.env['NODE_ENV'] == 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL';

if (!process.env[dbEnvVar]) {
  console.error(`Error: Missing ${dbEnvVar} environment variable`);
  process.exit(-1);
}

export const sql = postgres(
  process.env[dbEnvVar] as string,
  {
    max: process.env['DATABASE_POOL_SIZE'] ? parseInt(process.env['DATABASE_POOL_SIZE']) : 10,
    onnotice: process.env['NODE_ENV'] == 'test' ? () => {} : console.log,
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
      return reply.status(415).send({error: 'Unsupported media type'});
    }

    // custom HTTP header CSRF protection method
    // http://seclab.stanford.edu/websec/csrf/csrf.pdf
    if (!req.headers['x-csrf']) {
      reply.status(403).send({error: 'CSRF header missing'});
      return;
    }

    const user = Safe.optional(UserSerializer).read(req.session.get('loggedInUser'));
    
    /* Check route permissions against the logged in user */
    if (route.permissions !== "public") {
      const user_permissions = user && await UserCmd.getUserPermissions(user.guid);
      if (user_permissions === undefined) {
        reply.status(403).send({error: 'Permission denied'});
        return;
      }

      const missing_perms = UserCmd.getMissingPermissions({
        needed: new Set(route.permissions),
        has: user_permissions
      });

      if (missing_perms.size > 0) {
        reply.status(403).send({error: `Permission denied. Missing permissions: ${JSON.stringify(Array.from(missing_perms))}`});
        return;
      }
    }

    try {
      const _in = route.inputType.read((req.body as any).args);
      return { result: route.outputType.write(await handler(_in, user, req)) };
    } catch (e) {
      if (e instanceof Safe.ValidationError) {
        return reply.status(400).send({error: 'Invalid request'});
      } else {
        reply.status(500).send({error: 'Server error'});
        console.log(e.stack);
        throw e;
      }
    }
  });
}
