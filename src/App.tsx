import React, {useState, useEffect} from 'react';
import './App.css';
import Login from './Login';
import classnames from 'classnames';
import FuncRunner from './FuncRunner';
import RQLConvert from './RQLConvert';
import {Tabs, Tab} from '@leafygreen-ui/tabs';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as Realm from 'realm-web';
import copy from './copy.png';
import ChangesetDecoder from './ChangesetDecoder';
import ChangesetEncoder from './ChangesetEncoder';

const LOCAL_STORAGE_KEY = 'stitchutils_app';

function Lookup() {
  const [appID, setAppID] = useState<string>();
  const [error, setError] = useState<string | undefined>();

  const lookup = () => {
    setError(undefined);
    fetch('http://localhost:8080/api/private/v1.0/app/' + appID, {
      mode: 'cors',
    })
      .then(response => response.json())
      .then(info => {
        console.log(info);
      })
      .catch(err => {
        setError(err.toString());
      });
  };

  return (
    <div>
      <div className="input-group">
        <label>App ID</label>
        <input
          type="text"
          value={appID}
          onChange={e => setAppID(e.target.value)}
        />
        <button onClick={lookup}>Find</button>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

function App() {
  enum SelectedTab {
    FuncRunner,
    Lookup,
    RQLToMQL,
    ChangesetDecoder,
    ChangesetEncoder,
  }

  const [selected, setSelected] = useState(0);
  const [app, setApp] = useState<Realm.App>();
  const [currentTab, setCurrentTab] = useState<SelectedTab>(
    SelectedTab.FuncRunner,
  );

  const storeAppInfo = (appID: string, baseURL: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({appID, baseURL}));
  };

  const logout = async () => {
    if (app && app.currentUser) {
      try {
        await app.currentUser.logOut();
      } catch {
        console.log('deleting session failed');
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setApp(undefined);
    }
  };

  useEffect(() => {
    // code to run on component mount
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
      setApp(app as Realm.App);
    } catch (e) {}
  }, []);

  return (
    <div className="App">
      {app && app.currentUser ? (
        <div>
          <div>
            logged in as:&nbsp;
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

          <Tabs
            setSelected={setSelected}
            selected={selected}
            aria-label="SDgsdg">
            <Tab name="Function Runner">
              <FuncRunner user={app.currentUser} />
            </Tab>
            <Tab name="Convert RQL to MQL">
              <RQLConvert />
            </Tab>
            <Tab name="Changeset Decoder">
              <ChangesetDecoder />
            </Tab>
            <Tab name="Changeset Encoder">
              <ChangesetEncoder />
            </Tab>
          </Tabs>
        </div>
      ) : (
        <Login setApp={setApp} storeAppInfo={storeAppInfo} />
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
          <img src={copy} height="10px" alt="copy" />
        </button>
      </CopyToClipboard>
    </>
  );
}

export default App;
