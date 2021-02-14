import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import * as routes from "../common/routes";
import { User } from "../common/types";

function Root(props: { initialRoot: string }) {
  switch (props.initialRoot) {
    case 'login':
      return <LoginPage />
    default:
      return <DemoPage />
  }
}

function LoginPage(props: {}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    routes.tryLogin.call({ email, password }).then(success => {
      if (success) {
        // @ts-ignore
        window.location = '/';
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
}
    
function DemoPage(props: {}) {
  const [count, setCount] = React.useState(0);
  const [user, setUser] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    // XHR to /ping example endpoint
    routes.ping.call({}).then(console.log);
    routes.getLoggedInUser.call({}).then(setUser);
  }, []);

  function onClick() {
    setCount(count + 1);
    axios.get('/test').then(r => console.debug(r.data));
  }

  function onClickLogout() {
    routes.logout.call({}).then(() => {
      window.location.reload();
    });
  }

  return <>
    <h1>Hello, world!</h1>
    { user
        ? <div>{ user.email } is logged in. Click <a href="#" onClick={onClickLogout}>here</a> to log out.</div>
        : <div>Click <a href="/?q=#login">here</a> to log in</div>
    }
    You have clicked {count} times.
    <button onClick={() => onClick()}>Click me</button>
  </>
}

ReactDOM.render(
  <Root initialRoot={window.location.hash.slice(1)} />,
  document.body
);
