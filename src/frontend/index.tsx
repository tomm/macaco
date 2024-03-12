import { User } from "@common/macaco_common";
import * as pages from "@common/pages";
import * as routes from "@common/routes";
import React from "react";
import ReactDOM from "react-dom";
import { handlePage, pageUrl, Router, setPage } from "./macaco_frontend";
import "./style.css";

/**
 * A simple react App example of using frontend page routing, and backend api calls.
 */

handlePage(pages.Login, () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | undefined>(undefined);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        routes.tryLogin.call({ email, password }).then((success) => {
            if (success) {
                setPage(pages.DemoPage);
            } else {
                setError("Login failed. Try again");
            }
        });
    }

    return (
        <form onSubmit={(e) => handleSubmit(e)}>
            {error && <div>{error}</div>}
            <div>
                <label htmlFor="email">Email</label>
                <input name="email" type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                />
            </div>
            <input type="submit" value="Log in"></input>
        </form>
    );
});

handlePage(pages.DemoPageWithArgs, (props) => (
    <div>
        Hello, {props.pageArgs.name}.
        <br />
        <a href={pageUrl(pages.DemoPage)}>Back</a>
    </div>
));

handlePage(pages.DemoPage, () => {
    const [user, setUser] = React.useState<User | undefined>(undefined);

    React.useEffect(() => {
        // on start, load logged-in user via XHR
        routes.getLoggedInUser.call({}).then(setUser);
    }, []);

    function onClickLogout(e: React.MouseEvent) {
        e.preventDefault();
        routes.logout.call({}).then(() => window.location.reload());
    }

    return (
        <>
            <h1>Hello, macaco world!</h1>
            {user ? (
                <div>
                    {user.email} is logged in. Click{" "}
                    <button type="button" onClick={onClickLogout}>
                        here
                    </button>
                    to log out.
                </div>
            ) : (
                <div>
                    Click <a href={pageUrl(pages.Login)}>here</a> to log in
                </div>
            )}
            <br />
            <button type="button" onClick={(_e) => setPage(pages.DemoPageWithArgs, { name: "Bob" })}>
                Demo page with arguments (using onClick setPage)
            </button>
            <br />
            <a href={pageUrl(pages.DemoPageWithArgs, { name: "Tom" })}>Demo page with arguments (using href)</a>
        </>
    );
});

function NotFound() {
    return <div>Not found</div>;
}

ReactDOM.render(<Router notfound={NotFound} />, document.body);
