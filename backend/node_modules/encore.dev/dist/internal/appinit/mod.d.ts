import { Gateway } from "../../api/gateway.js";
import { Middleware } from "../../api/mod.js";
import * as runtime from "../runtime/mod.js";
export type Handler = {
    apiRoute: runtime.ApiRoute;
    middlewares: Middleware[];
    endpointOptions: EndpointOptions;
};
export declare function registerHandlers(handlers: Handler[]): void;
export declare function registerTestHandler(handler: Handler): void;
export declare function registerGateways(gateways: Gateway[]): void;
export declare function run(entrypoint: string): Promise<void>;
interface EndpointOptions {
    expose: boolean;
    auth: boolean;
    isRaw: boolean;
    isStream: boolean;
    tags: string[];
}
export interface InternalHandlerResponse {
    payload: any;
    extraHeaders?: Record<string, string | string[]>;
    status?: number;
}
export {};
