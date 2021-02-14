import * as Safe from "safe-portals";
import * as routes from "../common/routes";
import { FastifyInstance, FastifyRequest } from 'fastify';
import { User, UserSerializer } from "../common/types";

export type RouteHandler<IN, OUT> = (args: IN, user: User | undefined, req: FastifyRequest) => Promise<OUT>;

export function handleRoute<IN, OUT>(fastify: FastifyInstance, route: routes.Route<IN, OUT>, handler: RouteHandler<IN, OUT>) {
  fastify.post(route.path, async (req, reply) => {
    const user = Safe.optional(UserSerializer).read(req.session.get('loggedInUser'));
    try {
      const _in = route.inputType.read(req.body);
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
