import * as Fs from "@effect/platform/FileSystem";
import { Context, Data, Effect } from "effect";
import * as NFS from "fs";
import * as http from "http";
import * as Gzip from "./Gzip.js";

class FileError extends Data.TaggedError("FileError")<{
  error: unknown;
}> {}

export const downloadFolder = "./.download/";

const make = {
  download: ({
    toFilename,
    url,
    useCachedFile,
  }: {
    readonly url: string;
    readonly toFilename: string;
    readonly useCachedFile: boolean;
  }) =>
    Effect.gen(function* (_) {
      const fs = yield* _(Fs.FileSystem);
      const existsFilename = yield* _(fs.exists(toFilename));
      if (useCachedFile && existsFilename) {
        return yield* _(Effect.logDebug(`using cached file "${toFilename}"`));
      }

      const existsDownloadFolder = yield* _(fs.exists(downloadFolder));

      if (!existsDownloadFolder) {
        yield* _(Effect.logDebug(`creating folder ${downloadFolder}...`));
        yield* _(fs.makeDirectory(downloadFolder));
      }

      yield* _(Effect.logDebug(`downloading ${toFilename}...`));

      return yield* _(
        // TODO: Convert this to Effect (How to?)
        Effect.tryPromise({
          try: () =>
            new Promise<void>((resolve, reject) => {
              const writeStream = NFS.createWriteStream(toFilename);

              /**
               * IncomingMessage
               * https://effect-ts.github.io/effect/platform/Http/IncomingMessage.ts.html
               */
              const request = http.get(url, (response) => {
                response.pipe(writeStream);
                writeStream.on("finish", () => {
                  writeStream.close(() => resolve());
                });
              });

              request.on("error", async (err) => {
                NFS.unlinkSync(downloadFolder + toFilename);
                reject(err.message);
              });
            }),
          catch: (error) => new FileError({ error }),
        })
      );
    }),

  extractGzip: ({
    extractedFilename,
    gzipFilename,
    useCachedFile,
  }: {
    readonly gzipFilename: string;
    readonly extractedFilename: string;
    readonly useCachedFile: boolean;
  }) =>
    Effect.gen(function* (_) {
      const fs = yield* _(Fs.FileSystem);
      const gzip = yield* _(Gzip.Gzip);

      const existsExtractedFilename = yield* _(fs.exists(extractedFilename));
      if (useCachedFile && existsExtractedFilename) {
        return yield* _(
          Effect.logDebug(`using cached file "${extractedFilename}"`)
        );
      }

      yield* _(Effect.logDebug(`extracting ${gzipFilename}...`));

      yield* _(gzip({ gzipFilename, extractedFilename }));
    }),
};

export class File extends Context.Tag("File")<File, typeof make>() {}
