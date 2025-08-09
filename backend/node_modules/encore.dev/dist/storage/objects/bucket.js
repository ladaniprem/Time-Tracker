import { getCurrentRequest } from "../../internal/reqtrack/mod.js";
import * as runtime from "../../internal/runtime/mod.js";
import { unwrapErr } from "./error.js";
import { BucketPerms } from "./refs.js";
/**
 * Defines a new Object Storage bucket infrastructure resource.
 */
export class Bucket extends BucketPerms {
    impl;
    /**
     * Creates a new bucket with the given name and configuration
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(name, cfg) {
        super();
        this.impl = runtime.RT.bucket(name);
    }
    /**
     * Reference an existing bucket by name.
     * To create a new storage bucket, use `new StorageBucket(...)` instead.
     */
    static named(name) {
        return new Bucket(name, {});
    }
    async *list(options) {
        const source = getCurrentRequest();
        const iter = unwrapErr(await this.impl.list(options, source));
        while (true) {
            const entry = await iter.next();
            if (entry === null) {
                iter.markDone();
                break;
            }
            yield entry;
        }
    }
    /**
     * Returns whether the object exists in the bucket.
     * Throws an error on network failure.
     */
    async exists(name, options) {
        const source = getCurrentRequest();
        const impl = this.impl.object(name);
        const res = await impl.exists(options, source);
        return unwrapErr(res);
    }
    /**
     * Returns the object's attributes.
     * Throws an error if the object does not exist.
     */
    async attrs(name, options) {
        const source = getCurrentRequest();
        const impl = this.impl.object(name);
        const res = await impl.attrs(options, source);
        return unwrapErr(res);
    }
    /**
     * Uploads an object to the bucket.
     */
    async upload(name, data, options) {
        const source = getCurrentRequest();
        const impl = this.impl.object(name);
        const res = await impl.upload(data, options, source);
        return unwrapErr(res);
    }
    /**
     * Generate an external URL to allow uploading an object to the bucket.
     *
     * Anyone with possession of the URL can write to the given object name
     * without any additional auth.
     */
    async signedUploadUrl(name, options) {
        const source = getCurrentRequest();
        const impl = this.impl.object(name);
        const res = await impl.signedUploadUrl(options, source);
        return unwrapErr(res);
    }
    /**
     * Generate an external URL to allow downloading an object from the bucket.
     *
     * Anyone with possession of the URL can download the given object without
     * any additional auth.
     */
    async signedDownloadUrl(name, options) {
        const source = getCurrentRequest();
        const impl = this.impl.object(name);
        const res = await impl.signedDownloadUrl(options, source);
        return unwrapErr(res);
    }
    /**
     * Downloads an object from the bucket and returns its contents.
     */
    async download(name, options) {
        const source = getCurrentRequest();
        const impl = this.impl.object(name);
        const res = await impl.downloadAll(options, source);
        return unwrapErr(res);
    }
    /**
     * Removes an object from the bucket.
     * Throws an error on network failure.
     */
    async remove(name, options) {
        const source = getCurrentRequest();
        const impl = this.impl.object(name);
        const err = await impl.delete(options, source);
        if (err) {
            unwrapErr(err);
        }
    }
    /**
    * Returns the public URL for accessing the object with the given name.
    * Throws an error if the bucket is not public.
    */
    publicUrl(name) {
        const obj = this.impl.object(name);
        return obj.publicUrl();
    }
    ref() {
        return this;
    }
}
//# sourceMappingURL=bucket.js.map