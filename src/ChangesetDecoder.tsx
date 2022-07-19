import React, {useState} from 'react';
import { format } from 'util';
import {WasmWindow} from './WasmWindow';
import CopyToClipboard from 'react-copy-to-clipboard';
import copy from './copy.png';

declare var window: WasmWindow;

export default function ChangesetDecoder() {
  const [changeset, setChangeset] = useState<string>('');
  const [error, setError] = useState<string | undefined>('');
  const [results, setResults] = useState<string>();

  const execute = function(cs: string) {
    const result = window.decodeChangeset(cs, true);
    if (result.error) {
      setResults(undefined);
      setError(error);
    } else {
      setResults(result.decoded);
      setError(undefined);
    }
  };

  return (
    <div>
      <br />
      <div className="input-group">
        <label>Changeset (Encoded as Base64 or Hex)</label>
        <div>
        <textarea
          onChange={e => {
            setChangeset(e.target.value)
            execute(e.target.value)
          }}
        ></textarea>
        </div>
      </div>
      <br/>

      <div>
        <button onClick={() => {execute(changeset)}}>Decode</button>
      </div>
      {error && <div className="error">{error}</div>}
      <br />
      <br />
      {results && (
        <>
        <CopyToClipboard text={results}>
          <button className="copyButton">Copy to Clipboard </button>
        </CopyToClipboard>
        <div className="results" style={{fontFamily:"monospace", whiteSpace:"pre-wrap"}}>
          {results}
        </div>
        <CopyToClipboard text={results}>
          <button className="copyButton">Copy to Clipboard </button>
        </CopyToClipboard>
        </>
      )}
    </div>
  );
}
