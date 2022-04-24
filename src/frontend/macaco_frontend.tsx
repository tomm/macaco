import React from "react";
import { Page } from "../common/macaco_common";
import * as Safe from "safe-portals";
import { pageUrl } from "../common/macaco_common";
export { pageUrl } from "../common/macaco_common";

/**
 * Tiny, type-safe, validated frontend routing.
 */

type PageComponent<T> = React.SFC<{ pageArgs: T }> | React.ComponentClass<{ pageArgs: T }>;

type PageHandler<T> = {
  page: Page<T>,
  component: PageComponent<T>;
};

export function setPage<T>(page: Page<T>, args: T): void;
export function setPage(page: Page<void>, args?: void): void;
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
  console.log(`registering ${page.path}`);
}

function NotFound() {
  return <div>Not found</div>
}

export function Router() {
  const [rawPage, rawSetPage] = React.useState(window.location.hash.slice(1));

  window.addEventListener("hashchange", () => rawSetPage(window.location.hash.slice(1)), false);

  const path = rawPage.split('?', 1)[0];
  const page_handler = page_handlers[path];

  if (page_handler === undefined) {
    return <NotFound />
  } else {
    const rawArgs = decodeURIComponent(rawPage.slice(path.length + 1));
    let pageArgs;
    try {
      pageArgs = page_handler.page.argumentSerializer.read(rawArgs != '' ? JSON.parse(rawArgs) : null);
    } catch (e) {
      if (e instanceof Safe.ValidationError) {
        return <NotFound />
      } else {
        throw e;
      }
    }
    return <page_handler.component pageArgs={pageArgs} />
  }
}
