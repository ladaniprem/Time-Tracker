import Client, { Local } from "../encore-client";

// Determine backend base URL: Vite env overrides, else Encore local
export const BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || Local;

const backend = new Client(BASE_URL);

export default backend;

// Optionally re-export namespaces for types if needed by callers
export * from "../encore-client";


