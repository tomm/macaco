import * as Safe from "safe-portals";
import { UserSerializer, defineRoute } from "./macaco_common";

/**
 * Define your routes here.
 */
export const tryLogin = defineRoute(
  '/api/login',
  Safe.obj({ email: Safe.str, password: Safe.str }),
  Safe.bool
);

export const logout = defineRoute(
  '/api/logout',
  Safe.obj({}),
  Safe.nothing
);

export const getLoggedInUser = defineRoute(
  '/api/get_user',
  Safe.obj({}),
  Safe.optional(UserSerializer)
);

export const ping = defineRoute(
  '/ping',
  Safe.obj({}),
  Safe.str
);
