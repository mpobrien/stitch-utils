export interface WasmWindow extends Window {
  rqlToMQL: (
    rql: string,
  ) => {mql: string | undefined; error: string | undefined};
  decodeChangeset: (
    changeset: string,
    jsonFormat: boolean,
  ) => {decoded: string | undefined; error: string | undefined};
  encodeChangeset: (
    changeset: string,
  ) => {encoded: string | undefined; error: string | undefined};
}
