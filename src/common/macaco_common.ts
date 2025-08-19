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

/** A simple XMLHttpRequest wrapper for JSON-only POSTs */
async function httpJsonPost(url: string, payload: any, headers: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // listen for `load` event
        xhr.onload = () => {
            // print JSON response
            if (xhr.status < 200 || xhr.status >= 300) {
                reject(["HttpError", xhr.status, xhr.getResponseHeader("Content-Type"), xhr.responseText]);
            } else if (xhr.getResponseHeader("Content-Type")?.toLowerCase() !== "application/json; charset=utf-8") {
                reject(["UnexpectedContentType", xhr.status, xhr.getResponseHeader("Content-Type"), xhr.responseText]);
            } else {
                // parse JSON
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        reject(["InvalidJSON", xhr.status, xhr.getResponseHeader("Content-Type"), xhr.responseText]);
                    }
                    throw e;
                }
            }
        };

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.setRequestHeader("Accept", "application/json; charset=utf-8");

        for (const key of Object.getOwnPropertyNames(headers)) {
            xhr.setRequestHeader(key, headers[key]);
        }

        // send rquest with JSON payload
        xhr.send(JSON.stringify(payload));
    });
}

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
            const r = await httpJsonPost(path, { args: inputs.write(_in) }, { "x-csrf": "1" });
            return outputs.read(r.result);
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
