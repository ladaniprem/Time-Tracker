import * as runtime from "../runtime/mod.js";
export declare function apiCall(service: string, endpoint: string, data: any, opts?: runtime.CallOpts): Promise<any>;
export declare function streamInOut(service: string, endpoint: string, data: any, opts?: runtime.CallOpts): Promise<any>;
export declare function streamIn(service: string, endpoint: string, data: any, opts?: runtime.CallOpts): Promise<any>;
export declare function streamOut(service: string, endpoint: string, data: any, opts?: runtime.CallOpts): Promise<any>;
