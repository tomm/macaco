import React from "react";

/**
 * Simple frontend routing
 */

export type Page = string;

export function setPage(page: Page) {
  window.location.hash = page;
}

type PageComponent = React.SFC<any> | React.ComponentClass<any>;

const pages: Record<string, PageComponent> = {};

export function definePage(urlHash: string, component: PageComponent): Page {
  if (pages[urlHash] !== undefined) {
    throw new Error(`Attempt to redefine page #${urlHash}`);
  }

  pages[urlHash] = component;
  return urlHash;
}

export function Router() {
  const [rawPage, rawSetPage] = React.useState(window.location.hash.slice(1));

  window.addEventListener("hashchange", () => rawSetPage(window.location.hash.slice(1)), false);

  const Component = pages[rawPage];

  if (Component === undefined) {
    return <div>Not found</div>
  } else {
    return <Component />
  }
}
