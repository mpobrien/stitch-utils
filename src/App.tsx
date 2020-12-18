import React, {useState, useEffect} from 'react';
import './App.css';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as Realm from 'realm-web';
import ReactJson from 'react-json-view';
import copy from './copy.png';

const jsonDisplayDefaultProps = {
  indentWidth: 2,
  collapsed: 2,
  name: null,
  collapseStringsAfterLength: 128,
  groupArraysAfterLength: 100,
  enableClipboard: true,
  displayObjectSize: true,
  displayDataTypes: false,
};

enum AuthProvider {
  UserPassword = 'username/password',
  Anonymous = 'anonymous',
}

const LOCAL_STORAGE_KEY = 'stitchutils_app';

type PersistedAppConfig = {
  appID: string;
  baseURL: string;
};

function App() {
  const [baseURL, setBaseURL] = useState<string>('https://realm.mongodb.com');
  const [appID, setAppID] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [authProvider, setAuthProvider] = useState<AuthProvider>(
    AuthProvider.Anonymous,
  );
  const [app, setApp] = useState<Realm.App>();

  const logout = async () => {
    if (app && app.currentUser) {
      await app.currentUser.logOut();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setApp(undefined);
    }
  };
  const login = async () => {
    setLoginError('');
    const app: Realm.App = new Realm.App({id: appID, baseUrl: baseURL});
    let credentials;
    if (authProvider === AuthProvider.Anonymous) {
      credentials = Realm.Credentials.anonymous();
    } else if (authProvider === AuthProvider.UserPassword) {
      credentials = Realm.Credentials.emailPassword(username, password);
    } else {
      return;
    }
    try {
      // Authenticate the user
      const user: Realm.User = await app.logIn(credentials);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({appID, baseURL}));
      setApp(app);
      return user;
    } catch (err) {
      setLoginError(err.message);
    }
  };

  useEffect(() => {
    const storedAppInfo = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedAppInfo) {
      return;
    }
    try {
      const parsedAppInfo = JSON.parse(storedAppInfo);
      const app: Realm.App = new Realm.App({
        id: parsedAppInfo.appID,
        baseUrl: parsedAppInfo.baseURL,
      });
      if (!app.currentUser) {
        // not actually logged in
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      setApp(app);
    } catch (e) {}
    // code to run on component mount
  }, []);

  console.log(app);
  return (
    <div className="App">
      {app && app.currentUser ? (
        <div>
          <div>
            logged in as:{' '}
            <b>
              <CopyText text={app.currentUser.id} />
            </b>
            &nbsp; on <b>{app.id}</b>
            &nbsp;<button onClick={logout}>log out</button>
          </div>
          <br />
          {app.currentUser.accessToken && (
            <div>
              Access&nbsp;Token:&nbsp;&nbsp;
              <div className="accessToken">
                <CopyText text={app.currentUser.accessToken} />
              </div>
            </div>
          )}
          <hr />
          <FuncRunner user={app.currentUser} />
        </div>
      ) : (
        <form method="post" action="/form" autoComplete="off">
          <div className="input-group">
            <label>Base URL</label>
            <select onChange={e => setBaseURL(e.target.value)} value={baseURL}>
              {[
                'https://realm.mongodb.com',
                'https://realm-qa.mongodb.com',
                'https://realm-dev.mongodb.com',
                'https://realm-staging.mongodb.com',
                'http://localhost:8080',
              ].map(b => (
                <option value={b} key={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>App ID</label>
            <input
              type="text"
              placeholder="myapp-foo"
              onChange={e => setAppID(e.target.value)}
              value={appID}
            />
          </div>
          <div className="input-group">
            <br />
            <label>Auth Provider</label>
            <select
              onChange={e => setAuthProvider(e.target.value as AuthProvider)}
              value={authProvider}>
              {[AuthProvider.UserPassword, AuthProvider.Anonymous].map(b => (
                <option value={b} key={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          {authProvider === AuthProvider.UserPassword && (
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                onChange={e => setUsername(e.target.value)}
                value={username}
              />
            </div>
          )}
          {authProvider === AuthProvider.UserPassword && (
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                onChange={e => setPassword(e.target.value)}
                value={password}
              />
            </div>
          )}

          <div className="auth-wrapper">
            <button
              onClick={e => {
                e.preventDefault();
                login();
              }}
              disabled={appID.length === 0}>
              log in
            </button>
          </div>
          {loginError && <div className="error">{loginError}</div>}
        </form>
      )}
    </div>
  );
}

function CopyText(props: {text: string}) {
  return (
    <>
      <code>{props.text}</code>
      <CopyToClipboard text={props.text}>
        <button className="copyButton">
          <img src={copy} height="10px" />
        </button>
      </CopyToClipboard>
    </>
  );
}

type Result = {
  timeTakenMS: number;
  args: any;
  result: any;
};

function FuncRunner(props: {user: Realm.User}) {
  const [error, setError] = useState<string>('');
  const [args, setArgs] = useState<string>('[]');
  const [funcName, setFuncName] = useState<string>('foo');
  const [results, setResults] = useState<Result[]>([]);

  const execute = async () => {
    setError('');
    let parsedArgs;
    try {
      parsedArgs = JSON.parse(args);
    } catch (e) {
      setError("can't parse arguments: " + e.message);
      return;
    }
    try {
      const started = new Date();
      const result = await props.user.callFunction(funcName, parsedArgs);
      const finished = new Date();
      setResults([
        {
          result,
          timeTakenMS: finished.getTime() - started.getTime(),
          args: parsedArgs,
        },
        ...results,
      ]);
    } catch (e) {
      setError(e.message);
      return;
    }
  };

  return (
    <div>
      <div className="input-group">
        <label>Function Name</label>
        <input
          type="text"
          placeholder="functionName"
          value={funcName}
          onChange={e => setFuncName(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Function Arguments (extended JSON)</label>
        <textarea value={args} onChange={e => setArgs(e.target.value)} />
      </div>
      <br />
      <div>
        <button onClick={execute}>execute</button>
      </div>

      {error && (
        <>
          <br />
          <br />
          <div className="error">{error}</div>
        </>
      )}
      <br />
      <br />
      {results && (
        <div className="results">
          {results.map((r, i) => (
            <>
              {i !== 0 && <hr />}
              <FuncResult res={r} />
            </>
          ))}
        </div>
      )}
    </div>
  );
}

function FuncResult(props: {res: Result}) {
  return (
    <div>
      <div className="result">
        <div className="result-time">
          <i>{props.res.timeTakenMS}ms</i>
        </div>
        <div className="result-section">
          Arguments:{' '}
          <ReactJson src={props.res.args} {...jsonDisplayDefaultProps} />
        </div>
        <div className="result-section">
          Result:{' '}
          <ReactJson src={props.res.result} {...jsonDisplayDefaultProps} />
        </div>
      </div>
    </div>
  );
}

export default App;
