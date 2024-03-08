import axios from "axios";
import * as Safe from "safe-portals";
import { Permission } from "./permissions";

/* Types */
export const UserSerializer = Safe.obj({
    guid: Safe.uuid,
    email: Safe.str,
});

export type User = Safe.TypeIn<typeof UserSerializer>;

/* Convenient error-raising in expressions */

export function error(msg: any): never {
    throw new Error(msg);
}
export function bug(msg: any): never {
    throw new Error("Software bug:" + msg.toString());
}

/* Server HTTP endpoint routing */

export type Route<IN, OUT> = {
    path: string;
    permissions: "public" | Permission[];
    inputType: Safe.Obj<IN>;
    outputType: Safe.Type<OUT>;
    call: (_in: IN) => Promise<OUT>;
};

export function defineRoute<IN, OUT>(
    path: string,
    permissions: "public" | Permission[],
    inputs: Safe.Obj<IN>,
    outputs: Safe.Type<OUT>,
): Route<IN, OUT> {
    return {
        path,
        permissions,
        inputType: inputs,
        outputType: outputs,
        call: async (_in: IN): Promise<OUT> => {
            const r = await axios.post(path, { args: inputs.write(_in) }, { headers: { "x-csrf": "1" } });
            return outputs.read(r.data.result);
        },
    };
}

/* Frontend page routing */
export type Page<T> = {
    path: string;
    argumentSerializer: Safe.Type<T>;
};

export function definePage<T>(path: string, argumentSerializer: Safe.Type<T>): Page<T> {
    return { path, argumentSerializer };
}

export function pageUrl<T>(page: Page<T>, args: T): string;
export function pageUrl(page: Page<void>, args?: unknown): string;
// @ts-ignore
export function pageUrl(page, args) {
    if (args === null || args === undefined) {
        return `#${page.path}`;
    } else {
        return `#${page.path}?${JSON.stringify(page.argumentSerializer.write(args))}`;
    }
}
