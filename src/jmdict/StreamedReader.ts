import * as Error from "@effect/platform/Error";
import * as Fs from "@effect/platform/FileSystem";
import { Context, Effect, Layer } from "effect";

export class StreamedReader extends Context.Tag("StreamedReader")<
  StreamedReader,
  {
    getProgressFraction: () => bigint;
    skipTo: (str: string) => Effect.Effect<void, Error.PlatformError>;
    readTo: (str: string) => Effect.Effect<string | null, Error.PlatformError>;
  }
>() {
  static Live = (filename: string) =>
    Layer.effect(
      this,
      Effect.flatMap(Fs.FileSystem, (fs) =>
        Effect.gen(function* (_) {
          const file = yield* _(
            fs.open(filename, {
              flag: "r",
            })
          );

          const fileStats = yield* _(fs.stat(filename));
          const fileSize = fileStats.size;

          const bufferSize = 1_000_000;
          const buffer = globalThis.Buffer.alloc(bufferSize);

          let overallIndex = 0;
          let blockIndex = 0;
          let blockSize = globalThis.BigInt(0);

          const readNext = Effect.gen(function* (_) {
            if (blockIndex >= blockSize) {
              blockSize = yield* _(file.read(buffer));
              blockIndex = 0;
            }

            if (blockIndex >= blockSize) return null;

            const c = buffer[blockIndex];
            blockIndex++;
            overallIndex++;

            return c;
          });

          return {
            getProgressFraction: () =>
              globalThis.BigInt(overallIndex) / fileSize,

            skipTo: (str) =>
              Effect.gen(function* (_) {
                let at = 0;
                while (true) {
                  const readC = yield* _(readNext);
                  if (!readC) break;

                  if (readC == str.codePointAt(at)) {
                    at++;
                    if (at >= str.length) break;
                  } else {
                    at = 0;
                  }
                }
              }),

            readTo: (str) =>
              Effect.gen(function* (_) {
                let res: number[] = [];
                let at = 0;
                while (true) {
                  const readC = yield* _(readNext);
                  if (!readC) return null;

                  res.push(readC);

                  if (readC == str.codePointAt(at)) {
                    at++;
                    if (at >= str.length) break;
                  } else {
                    at = 0;
                  }
                }

                const resBuffer = globalThis.Buffer.from(res);
                return resBuffer.toString("utf8");
              }),
          };
        })
      )
    );
}
