import axios from "axios";
import * as Safe from "safe-portals";

/* Types */

export const UserSerializer = Safe.obj({
  guid: Safe.uuid,
  email: Safe.str
});

export type User = Safe.TypeIn<typeof UserSerializer>;

/* Convenient error-raising in expressions */

export function error(msg: any): never { throw new Error(msg); }
export function bug(msg: any): never { throw new Error("Software bug:" + msg.toString()); }

/* Routing */

export type Route<IN, OUT> = {
  path: string;
  inputType: Safe.Obj<IN>;
  outputType: Safe.Type<OUT>;
  call: (_in: IN) => Promise<OUT>;
}

export function defineRoute<IN, OUT>(path: string, inputs: Safe.Obj<IN>, outputs: Safe.Type<OUT>): Route<IN, OUT> {
  return {
    path,
    inputType: inputs,
    outputType: outputs,
    call: async (_in: IN): Promise<OUT> => {
      const csfr_token = document.cookie.split(';').find(item => item.trim().startsWith('macaco.csfr='))?.slice(12);
      const r = await axios.post(path, {
        csfr_token: csfr_token,
        args: inputs.write(_in)
      });
      return outputs.read(r.data);
    }
  }
}
