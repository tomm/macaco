import React from "react";
import * as Safe from "safe-portals";

/**
 * Simple frontend routing
 */

export type Page<T> = {
  path: string;
  component: PageComponent<T>;
  argumentSerializer: Safe.Type<T>;
};

export function setPage<T>(page: Page<T>, args: T): void;
export function setPage(page: Page<void>, args?: void): void;
// @ts-ignore
export function setPage(page, args) {
  if (args === null || args === undefined) {
    window.location.hash = page.path;
  } else {
    window.location.hash = `${page.path}?${JSON.stringify(page.argumentSerializer.write(args))}`;
  }
}

type PageComponent<T> = React.SFC<{ pageArgs: T }> | React.ComponentClass<{ pageArgs: T }>;

const pages: Record<string, Page<any>> = {};

export function definePage<T>(path: string, argumentSerializer: Safe.Type<T>, component: PageComponent<T>): Page<T> {
  if (pages[path] !== undefined) {
    throw new Error(`Attempt to redefine page #${path}`);
  }

  const page = { path, component, argumentSerializer };
  pages[path] = page;
  console.log(`registering ${path}`);
  return page;
}

function NotFound() {
  return <div>Not found</div>
}

export function Router() {
  const [rawPage, rawSetPage] = React.useState(window.location.hash.slice(1));

  window.addEventListener("hashchange", () => rawSetPage(window.location.hash.slice(1)), false);

  const path = rawPage.split('?', 1)[0];
  const page = pages[path];

  if (page === undefined) {
    return <NotFound />
  } else {
    const rawArgs = decodeURIComponent(rawPage.slice(page.path.length + 1));
    let pageArgs;
    try {
      pageArgs = page.argumentSerializer.read(rawArgs != '' ? JSON.parse(rawArgs) : null);
    } catch (e) {
      if (e instanceof Safe.ValidationError) {
        return <NotFound />
      } else {
        throw e;
      }
    }
    return <page.component pageArgs={pageArgs} />
  }
}
