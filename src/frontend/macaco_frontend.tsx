import { Page } from "@common/macaco_common";
import { pageUrl } from "@common/macaco_common";
import React from "react";
import * as Safe from "safe-portals";
export { pageUrl } from "@common/macaco_common";

/**
 * Tiny, type-safe, validated frontend routing.
 */

type PageComponent<T> = React.FunctionComponent<{ pageArgs: T }> | React.ComponentClass<{ pageArgs: T }>;

type PageHandler<T> = {
    page: Page<T>;
    component: PageComponent<T>;
};

export function setPage(page: Page<void>, args?: unknown): void;
export function setPage<T>(page: Page<T>, args: T): void;
// @ts-ignore
export function setPage(page, args) {
    window.location.hash = pageUrl(page, args);
}

const page_handlers: Record<string, PageHandler<any>> = {};

export function handlePage<T>(page: Page<T>, component: PageComponent<T>): void {
    if (page_handlers[page.path] !== undefined) {
        throw new Error(`Attempt to redefine page #${page.path}`);
    }

    page_handlers[page.path] = { page, component };
}

export function Router(props: { notfound: React.FunctionComponent | React.ComponentClass }) {
    const [rawPage, rawSetPage] = React.useState(window.location.hash.slice(1));

    window.addEventListener("hashchange", () => rawSetPage(window.location.hash.slice(1)), false);

    const path = rawPage.split("?", 1)[0];
    const page_handler = page_handlers[path];

    if (page_handler === undefined) {
        return <props.notfound />;
    } else {
        let pageArgs: unknown;
        try {
            const rawArgs = JSON.parse(decodeURIComponent(rawPage.slice(path.length + 1)) || "null");
            pageArgs = page_handler.page.argumentSerializer.read(rawArgs);
        } catch (e) {
            if (e instanceof Safe.ValidationError) {
                return <props.notfound />;
            } else if (e instanceof SyntaxError) {
                // JSON parse error
                return <props.notfound />;
            } else {
                throw e;
            }
        }
        return <page_handler.component pageArgs={pageArgs} />;
    }
}
