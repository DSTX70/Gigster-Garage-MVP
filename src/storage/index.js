// Factory + interface shape via JSDoc
import { ReplitAppStorageProvider } from "./replitAppStorage.js";

/**
 * @typedef {Object} StorageProvider
 * @property {(key:string, data:Buffer|import('stream').Readable, opts?:{contentType?:string, overwrite?:boolean})=>Promise<string>} put
 * @property {(key:string)=>Promise<{stream:import('stream').Readable, contentType?:string, size?:number}>} get
 * @property {(key:string)=>Promise<boolean>} exists
 * @property {(key:string)=>Promise<void>} delete
 */

export function makeStorage() {
  if (process.env.USE_GCS === "true") {
    // Lazy load real GCS only when explicitly enabled
    const { GCSStorageProvider } = require("./gcsProvider.js");
    return new GCSStorageProvider();
  }
  return new ReplitAppStorageProvider();
}