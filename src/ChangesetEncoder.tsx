import React, {useState} from 'react';
import { format } from 'util';
import {WasmWindow} from './WasmWindow';
import CopyToClipboard from 'react-copy-to-clipboard';
import copy from './copy.png';

declare var window: WasmWindow;

export default function ChangesetEncoder() {
  const [changeset, setChangeset] = useState<string>('');
  const [error, setError] = useState<string | undefined>('');
  const [results, setResults] = useState<string>();

  const execute = function(csJSON: string) {
    const result = window.encodeChangeset(csJSON);
    if (result.error) {
      setResults(undefined);
      setError(error);
    } else {
      setResults(result.encoded);
      setError(undefined);
    }
  };

  return (
    <div>
      <br />
        <label>Changeset (in JSON format)</label>
        <div >
        <textarea
        style={{minWidth:"500px", minHeight:"200px"}}
          onChange={e => {
            setChangeset(e.target.value)
            execute(e.target.value)
          }}
        ></textarea>
      </div>
      <br/>

      {error && <div className="error">{error}</div>}
      <br />
      <br />
      {results && (
        <>
        <CopyToClipboard text={results}>
          <button className="copyButton">Copy to Clipboard </button>
        </CopyToClipboard>
        <div className="results" style={{fontFamily:"monospace", wordBreak:"break-word"}}>
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
