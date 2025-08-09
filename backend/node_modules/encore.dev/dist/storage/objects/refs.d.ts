/// <reference types="node" />
import type { AttrsOptions, DeleteOptions, DownloadOptions, DownloadUrlOptions, ExistsOptions, ListEntry, ListOptions, ObjectAttrs, SignedDownloadUrl, SignedUploadUrl, UploadOptions, UploadUrlOptions } from "./bucket.js";
export declare abstract class BucketPerms {
    private bucketPerms;
}
export declare abstract class Uploader extends BucketPerms {
    abstract upload(name: string, data: Buffer, options?: UploadOptions): Promise<ObjectAttrs>;
}
export declare abstract class SignedUploader extends BucketPerms {
    abstract signedUploadUrl(name: string, options?: UploadUrlOptions): Promise<SignedUploadUrl>;
}
export declare abstract class Downloader extends BucketPerms {
    abstract download(name: string, options?: DownloadOptions): Promise<Buffer>;
}
export declare abstract class SignedDownloader extends BucketPerms {
    abstract signedDownloadUrl(name: string, options?: DownloadUrlOptions): Promise<SignedDownloadUrl>;
}
export declare abstract class Attrser extends BucketPerms {
    abstract attrs(name: string, options?: AttrsOptions): Promise<ObjectAttrs>;
    abstract exists(name: string, options?: ExistsOptions): Promise<boolean>;
}
export declare abstract class Lister extends BucketPerms {
    abstract list(options: ListOptions): AsyncGenerator<ListEntry>;
}
export declare abstract class Remover extends BucketPerms {
    abstract remove(name: string, options?: DeleteOptions): Promise<void>;
}
export declare abstract class PublicUrler extends BucketPerms {
    abstract publicUrl(name: string): string;
}
export type ReadWriter = Uploader & SignedUploader & Downloader & SignedDownloader & Attrser & Lister & Remover;
