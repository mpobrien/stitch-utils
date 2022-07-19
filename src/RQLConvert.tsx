import React, {useState} from 'react';
import {WasmWindow} from './WasmWindow';

declare var window: WasmWindow;

export default function RQLConvert() {
  const [rql, setRQL] = useState<string>('');
  const [error, setError] = useState<string | undefined>('');
  const [results, setResults] = useState<string>();

  const execute = function() {
    const {mql, error} = window.rqlToMQL(rql);
    if (error) {
      setResults(undefined);
      setError(error);
    } else {
      setResults(mql);
      setError(undefined);
    }
  };

  return (
    <div>
      <div className="input-group">
        <label>RQL Input</label>
        <input
          type="text"
          placeholder="x = '80085'"
          onChange={e => setRQL(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              execute();
            }
          }}
          value={rql}
        />
      </div>
      <div>
        <button onClick={execute}>execute</button>
      </div>

      {error && <div className="error">{error}</div>}
      <br />
      <br />
      {results && (
        <div className="results">
          <code>{results}</code>
        </div>
      )}
    </div>
  );
}
