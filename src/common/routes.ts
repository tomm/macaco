import * as Safe from "safe-portals";
import { UserSerializer, defineRoute } from "./macaco_common";

/**
 * Define your routes here.
 */
export const tryLogin = defineRoute(
  // XXX Must be on root (not /api) so cookie is set on domain root
  '/login',
  "public",
  Safe.obj({ email: Safe.str, password: Safe.str }),
  Safe.bool
);

export const logout = defineRoute(
  '/logout',
  [],
  Safe.obj({}),
  Safe.nothing
);

export const getLoggedInUser = defineRoute(
  '/api/get_user',
  "public",
  Safe.obj({}),
  Safe.optional(UserSerializer)
);

export const ping = defineRoute(
  '/ping',
  "public",
  Safe.obj({}),
  Safe.str
);
