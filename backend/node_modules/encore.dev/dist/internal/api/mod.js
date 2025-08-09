import * as runtime from "../runtime/mod.js";
import { getCurrentRequest } from "../reqtrack/mod.js";
import { APIError } from "../../api/error.js";
export async function apiCall(service, endpoint, data, opts) {
    const source = getCurrentRequest();
    const resp = await runtime.RT.apiCall(service, endpoint, data, source, opts);
    // Convert any call error to our APIError type.
    // We do this here because NAPI doesn't have great support
    // for custom exception types yet.
    if (resp instanceof runtime.ApiCallError) {
        throw new APIError(resp.code, resp.message, undefined, resp.details);
    }
    return resp;
}
export async function streamInOut(service, endpoint, data, opts) {
    const source = getCurrentRequest();
    const stream = await runtime.RT.stream(service, endpoint, data, source, opts);
    return {
        async send(msg) {
            stream.send(msg);
        },
        async recv() {
            return stream.recv();
        },
        async close() {
            stream.close();
        },
        async *[Symbol.asyncIterator]() {
            while (true) {
                try {
                    yield await stream.recv();
                }
                catch (e) {
                    break;
                }
            }
        }
    };
}
export async function streamIn(service, endpoint, data, opts) {
    const source = getCurrentRequest();
    const stream = await runtime.RT.stream(service, endpoint, data, source, opts);
    const response = new Promise(async (resolve, reject) => {
        try {
            resolve(await stream.recv());
        }
        catch (e) {
            reject(e);
        }
    });
    return {
        async send(msg) {
            stream.send(msg);
        },
        async close() {
            stream.close();
        },
        async response() {
            return response;
        }
    };
}
export async function streamOut(service, endpoint, data, opts) {
    const source = getCurrentRequest();
    const stream = await runtime.RT.stream(service, endpoint, data, source, opts);
    return {
        async recv() {
            return stream.recv();
        },
        async close() {
            stream.close();
        },
        async *[Symbol.asyncIterator]() {
            while (true) {
                try {
                    yield await stream.recv();
                }
                catch (e) {
                    break;
                }
            }
        }
    };
}
//# sourceMappingURL=mod.js.map