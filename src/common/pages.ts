import * as Safe from "safe-portals";
import { definePage } from "./macaco_common";

/* These are frontend pages. The definitions are here in `common`
 * so you can generate frontend page urls from the backend if desired.
 *
 * Actual page implementations (react components that handle these pages
 * are implemented in ../frontend
 */
export const Login = definePage("login", Safe.nothing);
export const DemoPageWithArgs = definePage("demo-page-with-args", Safe.obj({ name: Safe.str }));
export const DemoPage = definePage("", Safe.nothing);
