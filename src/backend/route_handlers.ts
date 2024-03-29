import * as routes from "@common/routes";
import { FastifyInstance } from "fastify";
import * as UserCmd from "./commands/macaco_user";
import { handleRoute } from "./macaco_core";

export function setupRoutes(fastify: FastifyInstance) {
    /**
     * Add your route handlers here
     */
    fastify.get("/ping", (req, resp) => {
        resp.send({ hello: "world" });
    });

    /**
     * Login with locally-stored credentials. (comment out to disable)
     */
    handleRoute(fastify, routes.tryLogin, async (args, _, req) => {
        const user = await UserCmd.checkUserLogin(args);
        if (user) {
            req.session.set("loggedInUser", user);
            return true;
        } else {
            req.session.set("loggedInUser", null);
            return false;
        }
    });

    handleRoute(fastify, routes.logout, async (args, user, req) => {
        req.session.set("loggedInUser", null);
    });

    handleRoute(fastify, routes.getLoggedInUser, async (args, user) => user);

    handleRoute(fastify, routes.ping, async (args, user, req) => {
        return "pong";
    });
}
