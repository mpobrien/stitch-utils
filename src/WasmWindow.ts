export interface WasmWindow extends Window {
  rqlToMQL: (
    rql: string,
  ) => {mql: string | undefined; error: string | undefined};
}
