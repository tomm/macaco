import React from "react";
import ReactDOM from "react-dom";
import * as routes from "../common/routes";
import { User } from "../common/macaco_common";
import { setPage, definePage, Router } from "./macaco_frontend";
import "./style.css";

const Login = definePage('login', (props: {}) => {
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
    
const DemoPage = definePage('', (props: {}) => {
  const [count, setCount] = React.useState(0);
  const [user, setUser] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    // XHR to /ping example endpoint
    routes.ping.call({}).then(console.log);
    routes.getLoggedInUser.call({}).then(setUser);
  }, []);

  function onClickLogout(e: React.MouseEvent) {
    e.preventDefault();
    routes.logout.call({}).then(() => {
      window.location.reload();
    });
  }

  function onClickLogin(e: React.MouseEvent) {
    e.preventDefault();
    setPage(Login);
  }

  return <>
    <h1>Hello, world!</h1>
    { user
        ? <div>{ user.email } is logged in. Click <a href="#" onClick={onClickLogout}>here</a> to log out.</div>
        : <div>Click <a href="#" onClick={onClickLogin}>here</a> to log in</div>
    }
    You have clicked {count} times.
    <button onClick={() => setCount(count + 1)}>Click me</button>
  </>
});

ReactDOM.render(<Router />, document.body);
