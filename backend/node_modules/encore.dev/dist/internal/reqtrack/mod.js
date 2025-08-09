import { AsyncLocalStorage } from "node:async_hooks";
const asyncLocalStorage = new AsyncLocalStorage();
export function setCurrentRequest(req) {
    asyncLocalStorage.enterWith(req);
}
export function getCurrentRequest() {
    return asyncLocalStorage.getStore() ?? null;
}
//# sourceMappingURL=mod.js.map