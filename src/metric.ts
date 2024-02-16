import * as NodeFs from "@effect/platform-node/NodeFileSystem";
import * as Fs from "@effect/platform/FileSystem";
import { Console, Effect, Metric } from "effect";

const numberCounter = Metric.counter("request_count", {
  description: "A counter for tracking requests",
});

Effect.gen(function* (_) {
  const fs = yield* _(Fs.FileSystem);
  const file = yield* _(fs.readFileString(`${__dirname}/file.txt`));
  yield* _(Console.log(`Got file`, file));
})
  .pipe(
    Effect.provide(NodeFs.layer),
    Effect.catchTags({
      BadArgument: (error) => Console.error(error),
      SystemError: (error) => Console.error(error),
    }),
    Effect.runPromise
  )
  .then(() => {});
