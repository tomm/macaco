import React from "react";
import ReactDOM from "react-dom";
import * as routes from "../common/routes";
import { User } from "../common/macaco_common";
import { pageUrl, setPage, definePage, Router } from "./macaco_frontend";
import * as Safe from "safe-portals";
import "./style.css";

/**
 * A simple react App example of using frontend page routing, and backend api calls.
 */

const Login = definePage('login', Safe.nothing, (props: {}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    routes.tryLogin.call({ email, password }).then(success => {
      if (success) {
        setPage(DemoPage);
      } else {
        setError("Login failed. Try again");
      }
    });
  }

  return <form onSubmit={e => handleSubmit(e)}>
    { error && <div>{ error }</div> }
    <div>
      <label htmlFor="email">Email</label>
      <input name="email" type="email" value={email} onChange={e => setEmail(e.currentTarget.value)} />
    </div>
    <div>
      <label htmlFor="password">Password</label>
      <input name="password" type="password" value={password} onChange={e => setPassword(e.currentTarget.value)} />
    </div>
    <input type="submit" value="Log in"></input>
  </form>
});

const DemoPageWithArgs = definePage(
  'demo-page-with-args',
  Safe.obj({name: Safe.str}),
  (props) => <div>
    Hello, { props.pageArgs.name }.
    <br /><a href={pageUrl(DemoPage)}>Back</a>
  </div>
);
    
const DemoPage = definePage('', Safe.nothing, (props: {}) => {
  const [user, setUser] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    // on start, load logged-in user via XHR
    routes.getLoggedInUser.call({}).then(setUser);
  }, []);

  function onClickLogout(e: React.MouseEvent) {
    e.preventDefault();
    routes.logout.call({}).then(() => window.location.reload());
  }

  return <>
    <h1>Hello, macaco world!</h1>
    { user
        ? <div>{ user.email } is logged in. Click <a href="#" onClick={onClickLogout}>here</a> to log out.</div>
        : <div>Click <a href={pageUrl(Login)}>here</a> to log in</div>
    }
    <br />
    <button onClick={e => setPage(DemoPageWithArgs, {name: 'Bob'})}>Demo page with arguments (using onClick setPage)</button>
    <br />
    <a href={pageUrl(DemoPageWithArgs, { name: 'Tom' })}>Demo page with arguments (using href)</a>
  </>
});

ReactDOM.render(<Router />, document.body);
