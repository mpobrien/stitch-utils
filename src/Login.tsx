import * as Realm from 'realm-web';
import React, {useState} from 'react';

enum AuthProvider {
  UserPassword = 'username/password',
  Anonymous = 'anonymous',
  APIKey = 'apikey',
}

interface LoginProps {
  setApp?: (app: Realm.App) => void;
  storeAppInfo: (appID: string, baseURL: string) => void;
}

export default function Login(props: LoginProps) {
  const [baseURL, setBaseURL] = useState<string>('https://realm.mongodb.com');
  const [appID, setAppID] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [authProvider, setAuthProvider] = useState<AuthProvider>(
    AuthProvider.Anonymous,
  );

  const login = async () => {
    setLoginError('');
    const app: Realm.App = new Realm.App({id: appID, baseUrl: baseURL});
    let credentials;
    if (authProvider === AuthProvider.Anonymous) {
      credentials = Realm.Credentials.anonymous();
    } else if (authProvider === AuthProvider.APIKey) {
      credentials = Realm.Credentials.userApiKey(apiKey);
    } else if (authProvider === AuthProvider.UserPassword) {
      credentials = Realm.Credentials.emailPassword(username, password);
    } else {
      return;
    }
    try {
      // Authenticate the user
      const user: Realm.User = await app.logIn(credentials);
      props.storeAppInfo(appID, baseURL);
      if (props.setApp) {
        props!.setApp(app);
      }
      return user;
    } catch (err) {
      setLoginError(err.message);
    }
  };

  return (
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
          {[
            AuthProvider.UserPassword,
            AuthProvider.Anonymous,
            AuthProvider.APIKey,
          ].map(b => (
            <option value={b} key={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      {authProvider === AuthProvider.APIKey && (
        <div className="input-group">
          <label>API Key</label>
          <input
            type="text"
            onChange={e => setApiKey(e.target.value)}
            value={apiKey}
          />
        </div>
      )}
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
  );
}
