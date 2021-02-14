import axios from "axios";
import * as Safe from "safe-portals";
import { UserSerializer } from "./types";

export type Route<IN, OUT> = {
  path: string;
  inputType: Safe.Obj<IN>;
  outputType: Safe.Type<OUT>;
  call: (_in: IN) => Promise<OUT>;
}

function defineRoute<IN, OUT>(path: string, inputs: Safe.Obj<IN>, outputs: Safe.Type<OUT>): Route<IN, OUT> {
  return {
    path,
    inputType: inputs,
    outputType: outputs,
    call: async (_in: IN): Promise<OUT> => {
      const r = await axios.post(path, inputs.write(_in));
      return outputs.read(r.data);
    }
  }
}

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
