import React, {useState} from 'react';
import * as Realm from 'realm-web';
import ReactJson from 'react-json-view';

type Result = {
  timeTakenMS: number;
  args: any;
  result: any;
};

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

export default function FuncRunner(props: {user: Realm.User}) {
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
