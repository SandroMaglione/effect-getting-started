import { Context, Data, Effect, Layer } from "effect";

// @ts-expect-error
import gunzip from "gunzip-file";

class GzipError extends Data.TaggedError("GzipError")<{
  error: unknown;
}> {}

const make = ({
  extractedFilename,
  gzipFilename,
}: {
  gzipFilename: string;
  extractedFilename: string;
}): Effect.Effect<any, GzipError, never> =>
  Effect.asyncEffect((resume) =>
    Effect.tryPromise({
      try: () =>
        gunzip(gzipFilename, extractedFilename, () =>
          resume(Effect.succeed(null))
        ),
      catch: (error) => new GzipError({ error }),
    })
  );

export class Gzip extends Context.Tag("Gzip")<Gzip, typeof make>() {
  static Live = Layer.succeed(this, make);
}
